User interfaces and communication tools for the [ARTIQ experiment control system](https://git.m-labs.hk/M-Labs/artiq).

- [sipyco-js](sipyco-js/): JavaScript implementation of [sipyco](https://git.m-labs.hk/M-Labs/sipyco) protocols
- [artiq-js](artiq-js/): JavaScript implementation of ARTIQ core structures such as e. g. datasets
- [artiq-web](artiq-web/): Browser-based interface
- [artiq-vscode](artiq-vscode/): Visual Studio Code extension

## Development

Start `artiq_master` with a device database containing the `wsproxy` controller.
This repository provides a minimal example:

```bash
artiq_master --device-db /path/to/artiq-js/device_db.py
```

In another terminal, start the controller manager from this repository's root:

```bash
cd /path/to/artiq-js
artiq_ctlmgr
```

For the web interface:

```bash
cd artiq-web
./run.sh
```

Navigate browser to http://localhost:8080

For the VS Code extension:

```bash
cd artiq-vscode
./setup.sh
code .
```

Press **F5** to launch an Extension Development Host with the ARTIQ extension loaded.

Both frontends build the shared sipyco-js and artiq-js libraries.
