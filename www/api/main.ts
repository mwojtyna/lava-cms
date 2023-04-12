import { init, PORT } from "./server";

const app = await init();
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
