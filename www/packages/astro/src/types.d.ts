import * as _prisma_client_runtime from "@prisma/client/runtime";
import * as SuperJSON from "superjson";
import * as _trpc_server from "@trpc/server";

export interface Meta {
	noAuth: boolean;
}

declare const publicRouter: _trpc_server.CreateRouterInner<
	_trpc_server.RootConfig<{
		ctx: object;
		meta: Meta;
		errorShape: _trpc_server.DefaultErrorShape;
		transformer: typeof SuperJSON.default;
	}>,
	{
		getConfig: _trpc_server.BuildProcedure<
			"query",
			{
				_config: _trpc_server.RootConfig<{
					ctx: object;
					meta: Meta;
					errorShape: _trpc_server.DefaultErrorShape;
					transformer: typeof SuperJSON.default;
				}>;
				_meta: Meta;
				_ctx_out: {};
				_input_in: typeof _trpc_server.unsetMarker;
				_input_out: typeof _trpc_server.unsetMarker;
				_output_in: typeof _trpc_server.unsetMarker;
				_output_out: typeof _trpc_server.unsetMarker;
			},
			{
				title: string;
				description: string;
				language: string;
			}
		>;
		getPage: _trpc_server.BuildProcedure<
			"query",
			{
				_config: _trpc_server.RootConfig<{
					ctx: object;
					meta: Meta;
					errorShape: _trpc_server.DefaultErrorShape;
					transformer: typeof SuperJSON.default;
				}>;
				_meta: Meta;
				_ctx_out: {};
				_input_in: {
					url: string;
				};
				_input_out: {
					url: string;
				};
				_output_in: typeof _trpc_server.unsetMarker;
				_output_out: typeof _trpc_server.unsetMarker;
			},
			| (_prisma_client_runtime.GetResult<
					{
						id: string;
						name: string;
						url: string;
						parent_id: string | null;
						is_group: boolean;
						last_update: Date;
					},
					unknown
			  > & {})
			| null
		>;
	}
>;
type PublicRouter = typeof publicRouter;

export { PublicRouter };
