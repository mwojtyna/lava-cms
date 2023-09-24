import { test } from "@admin/e2e/fixtures";
import { prisma } from "@admin/prisma/client";
import { type Page, expect } from "@playwright/test";

async function fillAddEditDialog(page: Page, name: string, expectedUrl: string) {
	const dialog = page.getByRole("dialog");
	await expect(dialog).toBeInViewport();

	await dialog.locator("input[type='text']").first().fill(name);
	await expect(dialog.locator("input[type='text']").nth(1)).toHaveValue(expectedUrl);
	await dialog.locator("button[type='submit']").click();

	return dialog;
}
async function checkRow(
	page: Page,
	rowIndex: number,
	name: string,
	url: string,
	type: "Page" | "Group",
) {
	const row = page.locator("tbody > tr").nth(rowIndex);
	await expect(row.locator("td").nth(1)).toHaveText(name);
	await expect(row.locator("td").nth(2)).toHaveText(url);
	await expect(row.locator("td").nth(3)).toHaveText(type);

	return row;
}

test.afterEach(async () => {
	await prisma.page.deleteMany();
});

test("displays message when no pages added", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/pages");
	await expect(page.base.locator("text=No results.")).toBeInViewport();
});

test("breadcrumbs", async ({ authedPage: page }) => {
	const rootGroup = await prisma.page.findFirst();
	const group1 = await prisma.page.create({
		data: {
			name: "Group 1",
			url: "/group-1",
			parent_id: rootGroup!.id,
			is_group: true,
		},
	});
	const group2 = await prisma.page.create({
		data: {
			name: "Group 2",
			url: "/group-1/group-2",
			parent_id: group1.id,
			is_group: true,
		},
	});
	await prisma.page.create({
		data: {
			name: "Group 3",
			url: "/group-1/group-2/group-3",
			parent_id: group2.id,
			is_group: true,
		},
	});

	await page.goto("/admin/dashboard/pages");
	await expect(page.base.getByTestId("breadcrumbs")).toHaveCount(0);
	await page.base.getByRole("link", { name: "Group 1" }).click();
	await page.base.waitForURL(`/admin/dashboard/pages/${group1.id}`);
	await page.base.getByRole("link", { name: "Group 2" }).click();
	await page.base.waitForURL(`/admin/dashboard/pages/${group2.id}`);

	const breadcrumbs = page.base.getByTestId("breadcrumbs");
	await expect(breadcrumbs).toContainText("Group 1 Group 2");

	await breadcrumbs.getByRole("link", { name: "Group 1" }).click();
	await expect(page.base).toHaveURL(`/admin/dashboard/pages/${group1.id}`);
	await expect(breadcrumbs).toContainText("Group 1");

	await breadcrumbs.getByRole("link").first().click();
	await expect(page.base).toHaveURL("/admin/dashboard/pages");
	await expect(breadcrumbs).toHaveCount(0);
});

test("searchbox filters items", async ({ authedPage: page }) => {
	const rootGroup = await prisma.page.findFirst();
	await prisma.page.createMany({
		data: [
			{
				name: "Page",
				url: "/test",
				parent_id: rootGroup!.id,
			},
			{
				name: "Page 2",
				url: "/test-2",
				parent_id: rootGroup!.id,
			},
		],
	});

	await page.goto("/admin/dashboard/pages");
	await expect(page.base.locator("tbody > tr")).toHaveCount(2);

	await page.base.locator("input[type='search']").type("Page 2");
	await expect(page.base.locator("tbody > tr")).toHaveCount(1);
	await checkRow(page.base, 0, "Page 2", "/test-2", "Page");
});

test.describe("page", () => {
	test("adds a page, shows error when conflict", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		await prisma.page.create({
			data: {
				name: "Test",
				url: "/test",
				parent_id: rootGroup!.id,
			},
		});

		await page.goto("/admin/dashboard/pages");
		await page.base.getByTestId("add-item").click();

		const dialog = await fillAddEditDialog(page.base, "Test", "/test");
		await expect(dialog.locator("input[name='slug']")).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.locator("strong")).toHaveText("/test");
		await fillAddEditDialog(page.base, "Test 2", "/test-2");
		await expect(dialog).toBeHidden();

		await checkRow(page.base, 0, "Test", "/test", "Page");
	});

	test("deletes a page", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		await prisma.page.create({
			data: {
				name: "Test",
				url: "/test",
				parent_id: rootGroup!.id,
			},
		});
		await page.goto("/admin/dashboard/pages");

		await page.base.locator("tbody > tr").first().locator("td").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Delete" }).click();

		const dialog = page.base.getByRole("dialog");
		await dialog.locator("button[type='submit']").click();

		await expect(page.base.locator("text=No results.")).toBeInViewport();
	});

	test("edits a page, shows error when conflict", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		await prisma.page.createMany({
			data: [
				{
					name: "Test",
					url: "/test",
					parent_id: rootGroup!.id,
				},
				{
					name: "Test 2",
					url: "/test-2",
					parent_id: rootGroup!.id,
				},
			],
		});

		await page.goto("/admin/dashboard/pages");
		await page.base.locator("tbody > tr").first().locator("td").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Edit details" }).click();

		const dialog = await fillAddEditDialog(page.base, "Test 2", "/test-2");
		await expect(dialog.locator("input[name='slug']")).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.locator("strong")).toHaveText("/test-2");
		await fillAddEditDialog(page.base, "Test 3", "/test-3");

		await checkRow(page.base, 1, "Test 3", "/test-3", "Page");
	});

	test("moves page, shows error when conflict", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		await prisma.page.create({
			data: {
				name: "Page 1",
				url: "/page-1",
				parent_id: rootGroup!.id,
			},
		});
		const group = await prisma.page.create({
			data: {
				name: "Group 1",
				url: "/group-1",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});
		await prisma.page.createMany({
			data: [
				{
					name: "Page 1",
					url: "/group-1/page-1",
					parent_id: group.id,
				},
				{
					name: "Group 2",
					url: "/group-2",
					parent_id: rootGroup!.id,
					is_group: true,
				},
			],
		});

		await page.goto("/admin/dashboard/pages");
		await page.base.locator("tbody > tr").last().locator("td").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Move" }).click();

		const dialog = page.base.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const combobox = dialog.getByRole("combobox");
		await combobox.click();
		await dialog.getByRole("option", { name: "Group 1" }).click();
		await dialog.locator("button[type='submit']").click();

		// Expect error
		await expect(combobox).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.locator("strong")).toHaveText("/group-1/page-1");

		// Move to group 2
		await combobox.click();
		await dialog.getByRole("option", { name: "Group 2" }).click();
		await dialog.locator("button[type='submit']").click();
		await expect(page.base.locator("tbody > tr")).toHaveCount(2);

		await page.base.getByRole("link", { name: "Group 2" }).click();
		await page.base.waitForURL("/admin/dashboard/pages/**");
		await checkRow(page.base, 0, "Page 1", "/group-2/page-1", "Page");
	});

	test("duplicates page, shows error when conflict", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		await prisma.page.create({
			data: {
				name: "Page 1",
				url: "/page-1",
				parent_id: rootGroup!.id,
			},
		});

		await page.goto("/admin/dashboard/pages");
		const lastTableRow = page.base.locator("tbody > tr").last();
		await lastTableRow.locator("td").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Duplicate" }).click();

		const dialog = page.base.getByRole("dialog");
		await expect(dialog).toBeInViewport();
		const nameInput = dialog.locator("input[name='name']");
		const submitButton = dialog.locator("button[type='submit']");

		await submitButton.click();
		await nameInput.fill("Page 1");
		await expect(dialog.locator("input[name='slug']")).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.locator("strong")).toHaveText("/page-1");

		await nameInput.fill("Page 2");
		await submitButton.click();

		await checkRow(page.base, 1, "Page 2", "/page-2", "Page");
	});
});

test.describe("group", () => {
	test("adds a group, shows error if conflict", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		await prisma.page.create({
			data: {
				name: "Test",
				url: "/test",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});

		await page.goto("/admin/dashboard/pages");
		await page.base.getByTestId("add-group").click();

		const dialog = await fillAddEditDialog(page.base, "Test", "/test");
		await expect(dialog.locator("input[name='slug']")).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.locator("strong")).toHaveText("/test");
		await fillAddEditDialog(page.base, "Test 2", "/test-2");
		await expect(dialog).toBeHidden();

		await checkRow(page.base, 0, "Test", "/test", "Group");
	});

	test("deletes a group and its children", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		const group = await prisma.page.create({
			data: {
				name: "Group 1",
				url: "/group-1",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});
		const nestedGroup = await prisma.page.create({
			data: {
				name: "Group 1",
				url: "/group-1/group-1",
				parent_id: group.id,
				is_group: true,
			},
		});
		await prisma.page.create({
			data: {
				name: "Page 1",
				url: "/group-1/group-1/page-1",
				parent_id: nestedGroup.id,
			},
		});

		await page.goto("/admin/dashboard/pages");
		await page.base.locator("tbody > tr").first().locator("td").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Delete" }).click();

		const dialog = page.base.getByRole("dialog");
		await expect(dialog).toBeInViewport();

		await dialog.locator("button[type='submit']").click();
		await page.base.waitForSelector("[role='dialog']", { state: "hidden" });

		expect(await prisma.page.findMany()).toHaveLength(1); // Always returns the root group
	});

	test("edits group and its children, shows error when conflict", async ({
		authedPage: page,
	}) => {
		const rootGroup = await prisma.page.findFirst();
		const group = await prisma.page.create({
			data: {
				name: "Group 1",
				url: "/group-1",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});
		await prisma.page.createMany({
			data: [
				{
					name: "Group 2",
					url: "/group-2",
					parent_id: rootGroup!.id,
					is_group: true,
				},
				{
					name: "Page 1",
					url: "/group-1/page-1",
					parent_id: group.id,
				},
			],
		});

		await page.goto("/admin/dashboard/pages");
		await page.base.locator("tbody > tr").first().locator("td").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Edit details" }).click();

		const dialog = await fillAddEditDialog(page.base, "Group 2", "/group-2");
		await expect(dialog.locator("input[name='slug']")).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.locator("strong")).toHaveText("/group-2");
		await fillAddEditDialog(page.base, "Group 3", "/group-3");

		await checkRow(page.base, 1, "Group 3", "/group-3", "Group");
		await page.base.locator("tbody > tr").nth(1).locator("td").nth(1).click();

		await checkRow(page.base, 0, "Page 1", "/group-3/page-1", "Page");
	});

	test("groups cannot have a slug containing only '/'", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		await prisma.page.create({
			data: {
				name: "Group 1",
				url: "/group-1",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});

		await page.goto("/admin/dashboard/pages");
		await page.base.locator("tbody > tr").first().locator("td").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Edit details" }).click();

		const dialog = page.base.getByRole("dialog");
		await dialog.locator("input[name='slug']").fill("/");
		await dialog.locator("button[type='submit']").click();

		await expect(dialog.locator("input[name='slug']")).toHaveAttribute("aria-invalid", "true");
	});

	test("moves group and its children, shows error when conflict", async ({
		authedPage: page,
	}) => {
		const rootGroup = await prisma.page.findFirst();

		const group1 = await prisma.page.create({
			data: {
				name: "Group 1",
				url: "/group-1",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});
		await prisma.page.createMany({
			data: [
				{
					name: "Group 2",
					url: "/group-1/group-2",
					parent_id: group1.id,
					is_group: true,
				},
				{
					name: "Group 3",
					url: "/group-3",
					parent_id: rootGroup!.id,
					is_group: true,
				},
			],
		});

		const group2 = await prisma.page.create({
			data: {
				name: "Group 2",
				url: "/group-2",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});
		await prisma.page.create({
			data: {
				name: "Page 1",
				url: "/group-2/page-1",
				parent_id: group2.id,
			},
		});

		await page.goto("/admin/dashboard/pages");
		await page.base.locator("tbody > tr").nth(1).locator("td").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Move" }).click();

		const dialog = page.base.getByRole("dialog");
		await expect(dialog).toBeInViewport();

		const combobox = dialog.getByRole("combobox");
		await combobox.click();
		await dialog.getByRole("option", { name: "Group 1" }).click();
		await dialog.locator("button[type='submit']").click();

		// Expect error
		await expect(combobox).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.locator("strong")).toHaveText("/group-1/group-2");

		// Move to group 3
		await combobox.click();
		await dialog.getByRole("option", { name: "Group 3" }).click();
		await dialog.locator("button[type='submit']").click();
		await expect(page.base.locator("tbody > tr")).toHaveCount(2);

		await page.base.getByRole("link", { name: "Group 3" }).click();
		await page.base.waitForURL("/admin/dashboard/pages/**");
		await checkRow(page.base, 0, "Group 2", "/group-3/group-2", "Group");

		await page.base.getByRole("link", { name: "Group 2" }).click();
		await page.base.waitForURL("/admin/dashboard/pages/**");
		await checkRow(page.base, 0, "Page 1", "/group-3/group-2/page-1", "Page");
	});
});

test.describe("bulk", () => {
	test("deletes items and their children", async ({ authedPage: page }) => {
		const rootGroup = await prisma.page.findFirst();
		const group = await prisma.page.create({
			data: {
				name: "Group 1",
				url: "/group-1",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});
		await prisma.page.createMany({
			data: [
				{
					name: "Group 2",
					url: "/group-2",
					parent_id: rootGroup!.id,
					is_group: true,
				},
				{
					name: "Page 1",
					url: "/group-1/page-1",
					parent_id: group.id,
				},
			],
		});

		await page.goto("/admin/dashboard/pages");

		const rows = page.base.locator("tbody > tr");
		await rows.first().locator("td").first().click();
		await rows.nth(1).locator("td").first().click();

		await page.base.locator("thead > tr > th").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Delete" }).click();
		await page.base.locator("button[type='submit']").click();
		await page.base.waitForSelector("[role='dialog']", { state: "hidden" });

		expect(await prisma.page.findMany()).toHaveLength(1); // Always returns the root group
	});

	test("moves items and their children, shows error when conflict", async ({
		authedPage: page,
	}) => {
		const rootGroup = await prisma.page.findFirst();

		const group1 = await prisma.page.create({
			data: {
				name: "Group 1",
				url: "/group-1",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});
		await prisma.page.createMany({
			data: [
				{
					name: "Group 11",
					url: "/group-1/group-11",
					parent_id: group1.id,
					is_group: true,
				},
				{
					name: "Group 3",
					url: "/group-3",
					parent_id: rootGroup!.id,
					is_group: true,
				},
				{
					name: "Page 1",
					url: "/page-1",
					parent_id: rootGroup!.id,
				},
			],
		});

		const group2 = await prisma.page.create({
			data: {
				name: "Group 2",
				url: "/group-2",
				parent_id: rootGroup!.id,
				is_group: true,
			},
		});
		await prisma.page.createMany({
			data: [
				{
					name: "Page 1",
					url: "/group-2/page-1",
					parent_id: group2.id,
				},
				{
					name: "Page 2",
					url: "/group-2/page-2",
					parent_id: group2.id,
				},
			],
		});

		await page.goto("/admin/dashboard/pages");

		const rows = page.base.locator("tbody > tr");
		await rows.first().locator("td").first().click();
		await rows.last().locator("td").first().click();

		await page.base.locator("thead > tr > th").last().click();
		await page.base.getByRole("menu").getByRole("menuitem", { name: "Move" }).click();

		const dialog = page.base.getByRole("dialog");
		await expect(dialog).toBeInViewport();

		const combobox = dialog.getByRole("combobox");
		await combobox.click();
		await dialog.getByRole("option", { name: "Group 2" }).click();
		await dialog.locator("button[type='submit']").click();

		await expect(dialog.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.locator("ul > li").first()).toHaveText("/group-2/page-1");

		await combobox.click();
		await dialog.getByRole("option", { name: "Group 3" }).click();
		await dialog.locator("button[type='submit']").click();
		await page.base.waitForSelector("[role='dialog']", { state: "hidden" });

		await page.base.getByRole("link", { name: "Group 3" }).click();
		await page.base.waitForURL("/admin/dashboard/pages/**");
		await checkRow(page.base, 0, "Group 1", "/group-3/group-1", "Group");
		await checkRow(page.base, 1, "Page 1", "/group-3/page-1", "Page");

		await page.base.getByRole("link", { name: "Group 1" }).click();
		await page.base.waitForURL("/admin/dashboard/pages/**");
		await checkRow(page.base, 0, "Group 11", "/group-3/group-1/group-11", "Group");
	});
});
