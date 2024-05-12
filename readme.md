# Logseq Plugin: Link to HTML

This plugin enhances your Logseq experience by converting web links into rich HTML formatted cards directly within your notes. Based on a fork of the [Logseq Plugin Link Preview](https://github.com/logseq/logseq-plugin-samples/tree/master/logseq-plugin-link-preview).

## Description

The "Link to HTML" plugin for Logseq allows users to fetch and display detailed web page information such as titles, images, descriptions, and more directly within their notes instead of a renderer in your notes file. This enriches the note-taking and reference experience by embedding rich content previews that can be customized directly in Logseq.

## How to Use

To use the plugin, simply type the slash command `/Link To HTML` followed by a URL. The plugin will fetch the relevant metadata from the URL and render it as a stylized HTML card in your Logseq journal.

**Example Usage:**
```
/Link To HTML then a prompt will show up and input the link https://example.com
```

## Making Changes

If you make any modifications to the plugin's source code, you will need to rebuild it using:

```bash
npm run build
```

After rebuilding, navigate to the Logseq plugins section, and if the plugin is already added, press "Reload" to apply the new changes. If it is not yet added, choose "Load unpacked plugin" and select your plugin's directory.

## Additional Feature

- **Auto-correction of URLs:** The plugin automatically corrects common URL input errors, ensuring that links are always formatted correctly.

## Installation

To install the plugin:

1. Download the plugin from the official repository.
2. Open Logseq and navigate to the plugins section.
3. Choose "Load unpacked plugin" and select the folder where you have saved the plugin.