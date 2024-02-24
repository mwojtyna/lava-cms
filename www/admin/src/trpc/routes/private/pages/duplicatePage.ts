import type { ArrayItem, ComponentInstance, ComponentInstanceField, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { urlRegex } from "@/src/trpc/utils";

type TX = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
type Kind = "component" | "field" | "arrayItem";

/** old id -> new id */
const idMap = new Map<string, string>();
/** old id -> kind */
const kindMap = new Map<string, Kind>();
/** new id -> parent field id */
const parentFieldIdMap = new Map<string, string | null>();
/** new id -> parent array item id */
const parentArrayItemIdMap = new Map<string, string | null>();

export const duplicatePage = privateProcedure
	.input(
		z.object({
			/** Id of the page you're duplicating */
			originId: z.string().cuid(),
			name: z.string(),
			url: z.string().regex(urlRegex),
			parentId: z.string().cuid().nullable(),
		}),
	)
	.mutation(async ({ input }): Promise<string> => {
		if (await prisma.page.findFirst({ where: { url: input.url } })) {
			throw new TRPCError({ code: "CONFLICT" });
		}

		let newPageId = "";

		await prisma.$transaction(async (tx) => {
			const original = await tx.page.findUnique({
				where: { id: input.originId },
			});
			if (!original) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const newPage = await tx.page.create({
				data: {
					name: input.name,
					url: input.url,
					parent_id: input.parentId,
				},
			});

			const components = await tx.componentInstance.findMany({
				where: { page_id: input.originId },
			});
			const promises = components.map((comp) => duplicateComponent(comp, newPage.id, tx));
			await Promise.all(promises);

			await replaceIds(tx);

			newPageId = newPage.id;
		});

		idMap.clear();
		kindMap.clear();
		parentFieldIdMap.clear();
		parentArrayItemIdMap.clear();

		return newPageId;
	});

// Unfortunately, prisma doesn't support returning from createMany, so we have to do multiple INSERT statements
async function duplicateComponent(
	component: ComponentInstance,
	newPageId: string,
	tx: TX,
): Promise<void> {
	const { id, ...data } = component;
	const newComponent = await tx.componentInstance.create({
		data: {
			...data,
			page_id: newPageId,
			parent_field_id: null,
			parent_array_item_id: null,
		},
	});
	kindMap.set(component.id, "component");
	idMap.set(component.id, newComponent.id);
	parentFieldIdMap.set(newComponent.id, component.parent_field_id);
	parentArrayItemIdMap.set(newComponent.id, component.parent_array_item_id);

	const fields = await tx.componentInstanceField.findMany({
		where: { component_id: component.id },
	});
	const promises = fields.map((field) => duplicateField(field, tx));
	await Promise.all(promises);
}

async function duplicateField(field: ComponentInstanceField, tx: TX): Promise<void> {
	const { id, ...data } = field;
	const newField = await tx.componentInstanceField.create({ data });
	kindMap.set(field.id, "field");
	idMap.set(field.id, newField.id);

	const arrayItems = await tx.arrayItem.findMany({ where: { parent_field_id: field.id } });
	const promises = arrayItems.map((item) => duplicateArrayItem(item, tx));
	await Promise.all(promises);
}

async function duplicateArrayItem(arrayItem: ArrayItem, tx: TX): Promise<void> {
	const { id, ...data } = arrayItem;
	const newArrayItem = await tx.arrayItem.create({ data });
	kindMap.set(arrayItem.id, "arrayItem");
	idMap.set(arrayItem.id, newArrayItem.id);
	parentFieldIdMap.set(newArrayItem.id, arrayItem.parent_field_id);
}

async function replaceIds(tx: TX) {
	const promises: Prisma.PrismaPromise<unknown>[] = [];

	const oldComponentIds: string[] = [];
	const newComponentIds: string[] = [];
	const oldFieldIds: string[] = [];
	const newFieldIds: string[] = [];
	const newArrayItemIds: string[] = [];
	kindMap.forEach((kind, oldId) => {
		switch (kind) {
			case "component": {
				oldComponentIds.push(oldId);
				newComponentIds.push(idMap.get(oldId)!);
				break;
			}
			case "field": {
				oldFieldIds.push(oldId);
				newFieldIds.push(idMap.get(oldId)!);
				break;
			}
			case "arrayItem": {
				newArrayItemIds.push(idMap.get(oldId)!);
				break;
			}
		}
	});

	newComponentIds.forEach((newId) => {
		const parentFieldId = parentFieldIdMap.get(newId);
		const parentArrayItemId = parentArrayItemIdMap.get(newId);
		promises.push(
			tx.componentInstance.update({
				where: { id: newId },
				data: {
					parent_field_id: parentFieldId ? idMap.get(parentFieldId)! : null,
					parent_array_item_id: parentArrayItemId ? idMap.get(parentArrayItemId)! : null,
				},
			}),
		);
	});

	oldFieldIds.forEach((oldId) => {
		promises.push(
			tx.arrayItem.updateMany({
				where: {
					AND: [{ id: { in: newArrayItemIds } }, { parent_field_id: oldId }],
				},
				data: {
					parent_field_id: { set: idMap.get(oldId) },
				},
			}),
		);
	});
	oldComponentIds.forEach((oldId) =>
		promises.push(
			tx.componentInstanceField.updateMany({
				where: {
					AND: [{ id: { in: newFieldIds } }, { component_id: oldId }],
				},
				data: {
					component_id: { set: idMap.get(oldId) },
				},
			}),
		),
	);

	await Promise.all(promises);
}
