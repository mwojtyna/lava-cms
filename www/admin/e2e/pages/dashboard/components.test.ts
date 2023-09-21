import { expect, type Locator, type Page } from "@playwright/test";
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
async function fillEditCompDefDialog(page: Page, name?: string, fields?: FieldDefinition[]) {
	const dialog = page.getByRole("dialog");
	await expect(dialog).toBeInViewport();

	if (name) {
		await dialog.locator("input[type='text']").first().fill(name);
	}
	for (const field of fields ?? []) {
		await dialog.locator("input[name='name']").fill(field.name);
		await dialog.getByRole("combobox").click();
		await page
			.getByRole("group")
			.locator(`div[data-value='${field.type.toLowerCase()}']`)
			.click();
		await dialog.locator("button[type='button']", { hasText: "Add" }).click();
	}
	// await dialog.locator("button[type='submit']").click();

	return dialog;
}
async function selectAction(page: Page, rowIndex: number, actionLabel: string) {
	await page.locator("tbody > tr").nth(rowIndex).locator("td").last().click();
	await page.getByRole("menu").getByRole("menuitem", { name: actionLabel }).click();
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
async function checkFieldDefs(page: Page, fieldDefs: FieldDefinition[]) {
	const fieldDefDivs = page.getByTestId("component-fields").locator("> div");
	for (const [i, fieldDef] of fieldDefs.entries()) {
		const fieldDefLabel = fieldDefDivs.nth(i).locator("span");
		await expect(fieldDefLabel.first()).toHaveText(fieldDef.name);
		await expect(fieldDefLabel.nth(1)).toHaveText(fieldDef.type, { ignoreCase: true });
	}
}

function getFieldDef(page: Page, nth: number): Locator {
	return page.getByTestId("component-fields").locator("> div").nth(nth);
}
async function editFieldDef(
	page: Page,
	nth: number,
	newName?: string,
	newType?: FieldDefinition["type"],
	save?: boolean,
): Promise<Locator> {
	const fieldDef = getFieldDef(page, nth);
	await fieldDef.getByTestId("edit-field-btn").click();

	if (newName) {
		await fieldDef.locator("input[name='name']").fill(newName);
	}
	if (newType) {
		await fieldDef.getByRole("combobox").click();
		await page.getByRole("group").locator(`div[data-value='${newType.toLowerCase()}']`).click();
	}

	if (save === undefined || save) {
		await fieldDef.getByTestId("save-field-btn").click();
	}
	return fieldDef;
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
	test("adds component definition, duplicate name errors", async ({ authedPage: page }) => {
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
		await dialog.waitFor({ state: "hidden" });

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
		await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: rootGroup!.id,
			},
		});

		await page.goto(URL);
		await selectAction(page, 0, "Delete");
		await page.getByRole("dialog").locator("button[type='submit']").click();

		await expect(page.locator("text=No results.")).toBeInViewport();
	});

	test("edits component definition (name & fields)", async ({ authedPage: page }) => {
		const rootGroup = await prisma.componentDefinitionGroup.findFirst();
		const originalComp = await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: rootGroup!.id,
				field_definitions: {
					createMany: {
						data: [
							{
								name: "Label",
								type: "TEXT",
								order: 0,
							},
							{
								name: "Description",
								type: "TEXT",
								order: 1,
							},
						],
					},
				},
			},
			include: {
				field_definitions: true,
			},
		});
		await page.goto(URL);
		const dialog = page.getByRole("dialog");

		await selectAction(page, 0, "Edit");
		await checkFieldDefs(page, originalComp.field_definitions);

		await dialog.locator("input[name='compName']").fill("Edited name");
		const fieldDef = await editFieldDef(page, 0, "Switch", "SWITCH");
		await expect(fieldDef).toHaveAttribute("data-test-diff", "edited");
		await dialog.locator("button[type='submit']").click();
		await dialog.waitFor({ state: "hidden" });

		const editedCompDef = await prisma.componentDefinition.findFirst({
			include: {
				field_definitions: {
					orderBy: { order: "asc" },
				},
			},
		});
		expect(editedCompDef?.name).toBe("Edited name");
		expect(editedCompDef!.field_definitions).toMatchObject([
			{
				name: "Switch",
				type: "SWITCH",
			} satisfies FieldDefinition,
			{
				name: "Description",
				type: "TEXT",
			} satisfies FieldDefinition,
		]);

		await checkRow(page, 0, "Edited name", "Component Definition");
		await selectAction(page, 0, "Edit");
		await checkFieldDefs(page, editedCompDef!.field_definitions);
	});
	test("edits component definition (name), duplicate name errors", async ({
		authedPage: page,
	}) => {
		const rootGroup = await prisma.componentDefinitionGroup.findFirst();
		const existingComp = await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: rootGroup!.id,
			},
		});
		const comp = await prisma.componentDefinition.create({
			data: {
				name: "Test 2",
				group_id: rootGroup!.id,
			},
		});

		await page.goto(URL);
		await selectAction(page, 1, "Edit");
		const dialog = page.getByRole("dialog");
		await dialog.locator("input[name='compName']").fill(existingComp.name);
		await dialog.locator("button[type='submit']").click();

		await expect(dialog.locator("input[name='compName']")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await expect(dialog.locator("strong")).toHaveText(existingComp.name);

		await dialog.locator("input[name='compName']").fill(comp.name);
		await dialog.locator("button[type='submit']").click();
		await dialog.waitFor({ state: "hidden" });

		await checkRow(page, 0, existingComp.name, "Component Definition");
		await checkRow(page, 1, comp.name, "Component Definition");
	});
});

test.describe("field definition", () => {
	test("edits field definition but restores edit", async ({ authedPage: page }) => {
		const rootGroup = await prisma.componentDefinitionGroup.findFirst();
		const originalComp = await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: rootGroup!.id,
				field_definitions: {
					createMany: {
						data: [
							{
								name: "Label",
								type: "TEXT",
								order: 0,
							},
						],
					},
				},
			},
			include: {
				field_definitions: true,
			},
		});
		await page.goto(URL);

		await selectAction(page, 0, "Edit");
		const dialog = page.getByRole("dialog");
		const fieldDef = await editFieldDef(page, 0, "Switch", "SWITCH");

		await expect(fieldDef).toHaveAttribute("data-test-diff", "edited");

		await fieldDef.getByTestId("restore-field-btn").click();
		await checkFieldDefs(page, originalComp.field_definitions);

		await dialog.locator("button[type='submit']").click();
		await dialog.waitFor({ state: "hidden" });

		const editedButRestoredCompDef = await prisma.componentDefinition.findFirst({
			include: {
				field_definitions: {
					orderBy: { order: "asc" },
				},
			},
		});
		expect(editedButRestoredCompDef!.field_definitions).toMatchObject(
			originalComp.field_definitions,
		);

		await selectAction(page, 0, "Edit");
		await checkFieldDefs(page, editedButRestoredCompDef!.field_definitions);
	});
	test("edits field definition but cancels edit", async ({ authedPage: page }) => {
		const rootGroup = await prisma.componentDefinitionGroup.findFirst();
		const originalComp = await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: rootGroup!.id,
				field_definitions: {
					createMany: {
						data: [
							{
								name: "Label",
								type: "TEXT",
								order: 0,
							},
						],
					},
				},
			},
			include: {
				field_definitions: true,
			},
		});
		await page.goto(URL);

		await selectAction(page, 0, "Edit");
		const dialog = page.getByRole("dialog");

		const fieldDef = await editFieldDef(page, 0, "Switch", "SWITCH", false);
		await fieldDef.getByTestId("cancel-field-btn").click();
		await checkFieldDefs(page, originalComp.field_definitions);

		await dialog.locator("button[type='submit']").click();
		await dialog.waitFor({ state: "hidden" });

		const editedButCancelledCompDef = await prisma.componentDefinition.findFirst({
			include: {
				field_definitions: {
					orderBy: { order: "asc" },
				},
			},
		});
		expect(editedButCancelledCompDef!.field_definitions).toMatchObject(
			originalComp.field_definitions,
		);

		await selectAction(page, 0, "Edit");
		await checkFieldDefs(page, editedButCancelledCompDef!.field_definitions);
	});

	test("adds field definition", async ({ authedPage: page }) => {
		await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: (await prisma.componentDefinitionGroup.findFirst())!.id,
			},
		});
		await page.goto(URL);
		await selectAction(page, 0, "Edit");

		const dialog = await fillEditCompDefDialog(page, undefined, [
			{ name: "Label", type: "TEXT" },
		]);
		const fieldDef = getFieldDef(page, 0);
		await expect(fieldDef).toHaveAttribute("data-test-diff", "added");

		await dialog.locator("button[type='submit']").click();
		await dialog.waitFor({ state: "hidden" });

		const addedCompDef = await prisma.componentDefinition.findFirst({
			include: {
				field_definitions: {
					orderBy: { order: "asc" },
				},
			},
		});
		expect(addedCompDef!.field_definitions).toMatchObject([
			{
				name: "Label",
				type: "TEXT",
			} satisfies FieldDefinition,
		]);

		await selectAction(page, 0, "Edit");
		await checkFieldDefs(page, addedCompDef!.field_definitions);
	});
	test("added field definition doesn't implement diff history", async ({ authedPage: page }) => {
		await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: (await prisma.componentDefinitionGroup.findFirst())!.id,
			},
		});
		await page.goto(URL);
		await selectAction(page, 0, "Edit");

		await fillEditCompDefDialog(page, undefined, [{ name: "Label", type: "TEXT" }]);
		const fieldDef = getFieldDef(page, 0);

		// After edit its diff state doesn't change
		await editFieldDef(page, 0, "Edited", "NUMBER");
		await expect(fieldDef).toHaveAttribute("data-test-diff", "added");

		// After delete it is removed instantly
		await fieldDef.getByTestId("delete-field-btn").click();
		await expect(fieldDef).toBeHidden();
	});

	test("deletes field definition", async ({ authedPage: page }) => {
		await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: (await prisma.componentDefinitionGroup.findFirst())!.id,
				field_definitions: {
					createMany: {
						data: [
							{
								name: "Label",
								type: "TEXT",
								order: 0,
							},
							{
								name: "Description",
								type: "TEXT",
								order: 1,
							},
						],
					},
				},
			},
			include: {
				field_definitions: true,
			},
		});
		await page.goto(URL);

		await selectAction(page, 0, "Edit");
		const fieldDef = getFieldDef(page, 0);
		await fieldDef.getByTestId("delete-field-btn").click();
		await expect(fieldDef).toHaveAttribute("data-test-diff", "deleted");

		const dialog = page.getByRole("dialog");
		await dialog.locator("button[type='submit']").click();
		await dialog.waitFor({ state: "hidden" });

		const editedCompDef = await prisma.componentDefinition.findFirst({
			include: {
				field_definitions: {
					orderBy: { order: "asc" },
				},
			},
		});
		expect(editedCompDef!.field_definitions).toMatchObject([
			{
				name: "Description",
				type: "TEXT",
			} satisfies FieldDefinition,
		]);

		await selectAction(page, 0, "Edit");
		await checkFieldDefs(page, editedCompDef!.field_definitions);
	});
	test("deletes field definition but restores", async ({ authedPage: page }) => {
		const originalComp = await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: (await prisma.componentDefinitionGroup.findFirst())!.id,
				field_definitions: {
					createMany: {
						data: [
							{
								name: "Label",
								type: "TEXT",
								order: 0,
							},
							{
								name: "Description",
								type: "TEXT",
								order: 1,
							},
						],
					},
				},
			},
			include: {
				field_definitions: true,
			},
		});
		await page.goto(URL);
		await selectAction(page, 0, "Edit");

		const fieldDef = getFieldDef(page, 0);
		await fieldDef.getByTestId("delete-field-btn").click();
		await expect(fieldDef).toHaveAttribute("data-test-diff", "deleted");
		await fieldDef.getByTestId("restore-field-btn").click();
		await expect(fieldDef).not.toHaveAttribute("data-test-diff", "deleted");

		const dialog = page.getByRole("dialog");
		await dialog.locator("button[type='submit']").click();
		await dialog.waitFor({ state: "hidden" });

		const editedCompDef = await prisma.componentDefinition.findFirst({
			include: {
				field_definitions: {
					orderBy: { order: "asc" },
				},
			},
		});
		expect(editedCompDef!.field_definitions).toMatchObject(originalComp.field_definitions);

		await selectAction(page, 0, "Edit");
		await checkFieldDefs(page, originalComp.field_definitions);
	});

	test("traverses field definitions diff history", async ({ authedPage: page }) => {
		const originalComp = await prisma.componentDefinition.create({
			data: {
				name: "Test",
				group_id: (await prisma.componentDefinitionGroup.findFirst())!.id,
				field_definitions: {
					createMany: {
						data: [
							{
								name: "Label",
								type: "TEXT",
								order: 0,
							},
						],
					},
				},
			},
			include: {
				field_definitions: true,
			},
		});
		await page.goto(URL);

		await selectAction(page, 0, "Edit");
		const fieldDef = await editFieldDef(page, 0, "Switch", "SWITCH");
		await fieldDef.getByTestId("delete-field-btn").click();
		await expect(fieldDef).toHaveAttribute("data-test-diff", "deleted");

		await fieldDef.getByTestId("restore-field-btn").click();
		await expect(fieldDef).toHaveAttribute("data-test-diff", "edited");
		await checkFieldDefs(page, [{ name: "Switch", type: "SWITCH" }]);

		await fieldDef.getByTestId("restore-field-btn").click();
		await expect(fieldDef).not.toHaveAttribute("data-test-diff", "edited");
		await checkFieldDefs(page, originalComp.field_definitions);
	});
});
