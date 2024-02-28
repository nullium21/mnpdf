# mnPDF

As of right now, Obsidian doesn't have a built-in way of generating PDFs from *multiple* notes at the same time without plugins, and this plugin aims to provide a solution for that problem.

## How to use

1. Install the plugin, either from GitHub or from Obsidian's registry.
2. Enable the plugin.
3. Click on the book icon in the ribbon: a view named **`Preview PDF`** should open.
4. *(Optionally)* Open the sidebar so that it's easier to use, using the `…` menu.
5. Add files.
6. *(Optionally)* Remove files.
7. Click on the save button.
8. **Profit! :tada:**

## How it works

Most of the PDF rendering code is in [PdfRenderer.ts](./src/preview/PdfRenderer.ts), but basically it:
1. generates a `div.print` with the rendered Markdown
2. prints that with electron's `WebContents.printToPDF()`
3. renders the resulting PDF with PDF.js!

## What it does *not* do yet (all is planned)

* no Table of Contents generation
* no page header/footer
* no "each file on own page"
