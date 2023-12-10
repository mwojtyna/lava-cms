import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

export const getAllGroups = privateProcedure.query(async () => {
	const groupsWithHierarchy = await prisma.$queryRaw<
		Array<{
			id: string;
			name: string;
			children_count: number;
			parent_group_name: string | null;
			hierarchy: string[];
		}>
	>`
	WITH RECURSIVE all_groups AS (
  	  SELECT
    	id,
    	name,
    	parent_group_id,
    	ARRAY[id] AS hierarchy,
    	(SELECT COUNT(*) FROM component_definition cd WHERE cd.group_id = component_definition_group.id) AS component_definition_count,
    	(SELECT COUNT(*) FROM component_definition_group cpg WHERE cpg.parent_group_id = component_definition_group.id) AS group_count,
    	NULL::TEXT AS parent_group_name
  	  FROM
    	component_definition_group
  	  WHERE
    	parent_group_id IS NULL
  	  UNION ALL
  	  SELECT
    	cdg.id,
    	cdg.name,
    	cdg.parent_group_id,
    	ag.hierarchy || cdg.id,
    	(SELECT COUNT(*) FROM component_definition cd WHERE cd.group_id = cdg.id),
    	(SELECT COUNT(*) FROM component_definition_group cpg WHERE cpg.parent_group_id = cdg.id),
    	ag.name as parent_group_name
  	  FROM
    	component_definition_group cdg
  	  INNER JOIN
    	all_groups ag
  	  ON
    	cdg.parent_group_id = ag.id
	)
	SELECT
  	  id,
  	  name,
	  (component_definition_count + group_count) as children_count,
  	  parent_group_name,
  	  hierarchy
	FROM
  	  all_groups
	ORDER BY
  	  hierarchy;
`;

	return groupsWithHierarchy;
});
