User interfaces and communication tools for the [ARTIQ experiment control system](https://git.m-labs.hk/M-Labs/artiq).

- [vscode-artiq](vscode-artiq/): Visual Studio Code extension
- [web-artiq](web-artiq/): Browser-based interface
- [js-sipyco](js-sipyco/): JavaScript implementation of [sipyco](https://git.m-labs.hk/M-Labs/sipyco) protocols

## Development

For the VS Code extension:

```bash
cd vscode-artiq
./setup.sh
code .
```

Press **F5** to launch an Extension Development Host with the ARTIQ extension loaded.

For the web interface:

```bash
cd web-artiq
./run.sh
```

Both build the shared js-sipyco library.
