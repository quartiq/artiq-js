User interfaces and communication tools for the [ARTIQ experiment control system](https://git.m-labs.hk/M-Labs/artiq).

- [sipyco-js](sipyco-js/): JavaScript implementation of [sipyco](https://git.m-labs.hk/M-Labs/sipyco) protocols
- [artiq-js](artiq-js/): JavaScript implementation of ARTIQ core structures such as e. g. datasets
- [artiq-web](artiq-web/): Browser-based interface
- [artiq-vscode](artiq-vscode/): Visual Studio Code extension

## Development

For the VS Code extension:

```bash
cd artiq-vscode
./setup.sh
code .
```

Press **F5** to launch an Extension Development Host with the ARTIQ extension loaded.

For the web interface:

```bash
cd artiq-web
./run.sh
```

Both build the shared sipyco-js and artiq-js libraries.
