# Overview

TODO: Add Arguments Sidebar

- [x] "ARTIQ" View Container in Activity Bar
    - [x] "Explorer" TreeView in Primary Sidebar
    - [x] "Experiment" WebView in Primary Sidebar
    - [x] "Datasets" TreeView in Primary Sidebar

- [x] "ARTIQ" View Container in Panel
    - [x] "Log" WebView in Panel
    - [x] "Schedule" WebView in Panel

- [x] Error message on bad connection to ARTIQ server
- [x] Call to install "ms-python" extension, if missing

# "Explorer" TreeView

- [x] "Scan Repository" button in View Toolbar

- on load:
    - [x] cache repository experiments via ARTIQ server
    - [x] list all repository experiments by name

- on click on TreeItem, in Editor:
    - [x] open corresponding file
    - [x] selects first line/char of corresponding class

- on click on "Scan Repository" button:
    - [x] request scan via ARTIQ server
    - on response:
        - [x] update repo cache
        - [x] update list of TreeItems
        - [x] update "Experiment" view

# Editor

- on change of selection:
    - [x] check db for corresponding experiment
    - [x] if none, hint scan or examination in "Experiment" view

    - in "Explorer":
        - [x] select corresponding TreeItem
        - [ ] otherwise deselect any TreeItem

    - in "Experiment":
        - [x] show corresponding submit form
        - [x] transfer db data into form fields
        - [x] otherwise hide submit form

# "Experiment"

- [x] "Submit Experiment" button in View Toolbar
- [x] "Examine File" button in View Toolbar
- [ ] "Forget custom params" button in View Toolbar

- form consists of:
    - [x] "Priority" input field
    - [x] "Log level" input field
    - [x] "Pipeline" input field
    - [x] "Flush" checkbox
    - [x] "Submit" button

- on focus drop of input field
    - [x] persistantly save custom params

- on click on "Submit" form button
    - [x] submit experiment via ARTIQ server

- on click on "Submit Experiment" toolbar button
    - [x] submit experiment via ARTIQ server
    - [x] shortcut Ctrl+Shift+X

- on click on "Examine File" button:
    - [x] request examination via ARTIQ server
    - [ ] shortcut Ctrl+Shift+E (?)
    - on response:
        - [x] update exam cache
        - [x] update "Experiment" view

- on change of file:
    - [ ] hide "Examine File" button if active file is repository file

# "Datasets"

- [x] TreeItem.label is node name
- [x] TreeItem.description is formatted value
- [x] TreeItem.checkbox is persist
- [ ] TreeItem.label.highlights marquee indicates activity/update
- [x] metadata properties are leafnodes
- [x] on move, focus and expand corresponding TreeItem
- [x] show delete and move actions for dataset items inline

- on load:
    - [x] list all dataset nodes hierarchically

- on context on intermediate TreeItem:
    - [ ] show "Delete this subtree" command

- on drag of intermediate TreeItem:
    - [ ] move to selected subtree on drop

- on click on Dataset and Metadata TreeItems:
    - [x] show InputBox
