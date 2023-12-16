## STROMDAO EAF Administration Client

This is the administration client for [STROMDAO's Energy Application Framework](https://github.com/energychain/STROMDAO_EAFs) (EAF). `eaf-admin-client` allows you to perform various administrative tasks from the command line, such as creating reading update tokens for new meters, managing user roles, and more. This utility is designed to streamline administrative workflows and support energy applications that leverage the STROMDAO EAF.

## Getting Started

### Prerequisites

To use `eaf-admin-client`, you will need Node.js installed on your system. Make sure you have Node.js version 10 or higher. You can download and install Node.js from [Node.js official website](https://nodejs.org/).

### Installation

To install the `eaf-admin-client`, run the following command:

```sh
npm install -g eaf-admin-client
```

This will install the client globally on your system allowing you to run it from anywhere.

### Configuration

Before you can start using the client, you need to set up your environment with the appropriate API keys and endpoints.

Create a `.env` file in the root directory of your project with the following entries:

```plaintext
EAF_API_KEY=your_api_key_here EAF_API_ENDPOINT=your_eaf_api_endpoint_here
```

Replace `your_api_key_here` and `your_eaf_api_endpoint_here` with the actual values provided by STROMDAO.

## Usage

### Creating a Reading Update Token for a New Meter

To create a token:

```sh
eaf-admin-client createMeterJWT --meterId <meter_id>
```

Replace `<meter_id>` with the actual ID of the meter for which you want to create a token.

### Other Administrative Tasks

For a list of all available commands and their options, run:

## Contributing

Contributions to `eaf-admin-client` are welcome. Please ensure that your code adheres to the existing style and that all tests pass.

## Support

If you encounter any issues or need assistance, please [open an issue](https://github.com/energychain/STROMDAO_EAFs/issues) on our GitHub repository.

## License

Distributed under the Apache-2.0 License. See [License](./LICENSE) for more information.


## Maintainer / Imprint

<addr>
STROMDAO GmbH  <br/>
Gerhard Weiser Ring 29  <br/>
69256 Mauer  <br/>
Germany  <br/>
  <br/>
+49 6226 968 009 0  <br/>
  <br/>
dev@stromdao.com  <br/>
  <br/>
Handelsregister: HRB 728691 (Amtsgericht Mannheim)<br/>
  <br/>
https://stromdao.de/<br/>
</addr>


## Disclaimer

This tool is part of the STROMDAO infrastructure and is intended for use with STROMDAO services. Use it at your own risk. STROMDAO is not responsible for any misuse or damage caused by this tool.

