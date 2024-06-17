import { app, userService } from "..";
import axios from 'axios'

export default function () {
    app.get("/fortnite/api/storefront/v2/keychain", async (c) => {
        const keychainResponse = await axios.get("https://api.nitestats.com/v1/epic/keychain");
        return c.json(keychainResponse.data);
      });
}