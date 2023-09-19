import { expect, type Page } from "@playwright/test";
import { test } from "@admin/e2e/fixtures";
import { prisma } from "@admin/prisma/client";
import type { FieldDefinitionUI } from "@admin/app/dashboard/components/dialogs/component-definition/shared";

const URL = "/admin/dashboard/components";

type FieldDefinition = Pick<FieldDefinitionUI, "name" | "type">;
async function fillAddCompDefDialog(page: Page, name: string, fields?: FieldDefinition[]) {
	const dialog = page.getByRole("dialog");
	await expect(dialog).toBeInViewport();

	await dialog.locator("input[type='text']").first().fill(name);
	for (const field of fields ?? []) {
		await dialog.locator("input[name='name']").fill(field.name);
		await dialog.getByRole("combobox").click();
		await page
			.getByRole("group")
			.locator(`div[data-value='${field.type.toLowerCase()}']`)
			.click();
		await dialog.locator("button[type='button']", { hasText: "Add" }).click();
	}
	await dialog.locator("button[type='submit']").click();

	return dialog;
}
async function checkRow(
	page: Page,
	rowIndex: number,
	name: string,
	type: "Component Definition" | "Group",
) {
	const row = page.locator("tbody > tr").nth(rowIndex);
	await expect(row.locator("td").nth(1)).toHaveText(name);
	await expect(row.locator("td").nth(3)).toHaveText(type);

	return row;
}

test.afterEach(async () => {
	await prisma.componentDefinitionGroup.deleteMany();
});

test("displays message when no pages added", async ({ authedPage: page }) => {
	await page.goto(URL);
	await expect(page.locator("text=No results.")).toBeInViewport();
});

test("breadcrumbs", async ({ authedPage: page }) => {
	const rootGroup = await prisma.componentDefinitionGroup.findFirst();
	const group1 = await prisma.componentDefinitionGroup.create({
		data: {
			name: "Group 1",
			parent_group_id: rootGroup!.id,
		},
	});
	const group2 = await prisma.componentDefinitionGroup.create({
		data: {
			name: "Group 2",
			parent_group_id: group1.id,
		},
	});
	await prisma.componentDefinitionGroup.create({
		data: {
			name: "Group 3",
			parent_group_id: group2.id,
		},
	});

	await page.goto(URL);
	await expect(page.getByTestId("breadcrumbs")).toHaveCount(0);
	await page.getByRole("link", { name: "Group 1" }).click();
	await page.waitForURL(URL + "/" + group1.id);
	await page.getByRole("link", { name: "Group 2" }).click();
	await page.waitForURL(URL + "/" + group2.id);

	const breadcrumbs = page.getByTestId("breadcrumbs");
	await expect(breadcrumbs).toContainText("Group 1 Group 2");

	await breadcrumbs.getByRole("link", { name: "Group 1" }).click();
	await expect(page).toHaveURL(URL + "/" + group1.id);
	await expect(breadcrumbs).toContainText("Group 1");

	await breadcrumbs.getByRole("link").first().click();
	await expect(page).toHaveURL(URL);
	await expect(breadcrumbs).toHaveCount(0);
});

test("searchbox filters items", async ({ authedPage: page }) => {
	const rootGroup = await prisma.componentDefinitionGroup.findFirst();
	await prisma.componentDefinitionGroup.create({
		data: {
			name: "Group 1",
			parent_group_id: rootGroup!.id,
		},
	});
	await prisma.componentDefinition.create({
		data: {
			name: "Component 1",
			group_id: rootGroup!.id,
		},
	});

	await page.goto(URL);
	await expect(page.locator("tbody > tr")).toHaveCount(2);

	await page.locator("input[type='search']").fill("Component");
	await expect(page.locator("tbody > tr")).toHaveCount(1);
	await checkRow(page, 0, "Component 1", "Component Definition");
});

test.describe("component definition", () => {
	test("adds component definition, check for duplicate name handling", async ({
		authedPage: page,
	}) => {
		const rootGroup = await prisma.componentDefinitionGroup.findFirst();
		const existingComp = await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: rootGroup!.id,
			},
		});

		await page.goto(URL);
		await page.getByTestId("add-item").click();
		const dialog = await fillAddCompDefDialog(page, existingComp.name, [
			{ name: "Label", type: "TEXT" },
		]);
		await expect(dialog.locator("input[name='compName']")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await expect(dialog.locator("strong")).toHaveText(existingComp.name);

		await fillAddCompDefDialog(page, "Test 2");
		await expect(dialog).toBeHidden();

		await checkRow(page, 1, "Test 2", "Component Definition");
		const newComp = await prisma.componentDefinition.findFirst({
			where: { name: "Test 2" },
			include: {
				field_definitions: {
					select: { name: true, type: true },
				},
			},
		});
		expect(newComp!.field_definitions).toMatchObject([
			{
				name: "Label",
				type: "TEXT",
			} satisfies FieldDefinition,
		]);
	});

	test("deletes component definition", async ({ authedPage: page }) => {
		const rootGroup = await prisma.componentDefinitionGroup.findFirst();
		const comp = await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: rootGroup!.id,
			},
		});

		await page.goto(URL);
		await checkRow(page, 0, comp.name, "Component Definition");

		await page.locator("tbody > tr").first().locator("td").last().click();
		await page.getByRole("menu").getByRole("menuitem", { name: "Delete" }).click();
		await page.getByRole("dialog").locator("button[type='submit']").click();

		await expect(page.locator("text=No results.")).toBeInViewport();
	});
});
