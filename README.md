# FeatherPanel Client

This is the web client for the FeatherPanel project. It is built using Svelte and Vite.

## Installation

To install a full FeatherPanel server, you can follow the instructions on the [FeatherPanel documentation](https://featherpanel.natoune.fr/docs/installation).

If you want to install only the client for development purposes, you can run the following commands:

```bash
git clone https://github.com/FeatherPanel/Client.git
cd Client
npm install
```

## Building

**⚠️ Make sure there is an empty config.json file in the root of the project.**

You can then run the following command to build the client:

```bash
npm run build
```

The built files will be in the `dist` folder.

You can then add the files in the `dist` folder to the `public` folder of the FeatherPanel server.

## Development

Before starting the development server, you need to create a `config.json` file in the root of the project. You can use the following template:

```json
{
	"app": {
		"name": "FeatherPanel Demo",
		"url": "http://127.0.0.1:8080", // The URL of the FeatherPanel API !!!
		"httpPort": 8080,
		"httpsPort": 8443,
		"ssl": false,
		"lang": "fr",
		"contact": "featherpanel@natoune.fr"
	},
	"userSettings": {
		"enableRegistration": true,
		"enablePasswordChange": true,
		"enableAccountDetailsChange": true
	},
	"version": "1.0.0"
}
```

You can then run the following command to start a development server:

```bash
npm run dev
```

The development server will be available at `http://localhost:5173`.

## License

This project is licensed under the MIT license. See the [LICENSE.md](LICENSE.md) file for more information.

The licenses for the dependencies of this project can be found in the [LICENSES](LICENSES) file.
