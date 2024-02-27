import { getCurrentWebContents } from "@electron/remote";
import { App, Component, MarkdownRenderer, TFile } from "obsidian";
import { PDFDocumentProxy } from "pdfjs-dist";

import { El } from "./util";

type ToPdfCallback = (data: Uint8Array) => void;

export default class PdfRenderer {
    static async toPdf(cb: ToPdfCallback, ...el: Node[]): Promise<void> {
        const target = El(document.body, `div.print.pdf-content`);
        target.append(...el);

        // this doesn't fucking work
        // idk why
        // fml

        // copy the Node.js `Buffer` over to renderer process
        // since it often gets deleted by the GC before usage
        await getCurrentWebContents().printToPDF({}).then(buf => {
            // delete the target to not keep too many copies of it
            target.remove();
            cb(buf);
        });
    }

    static async filesToPdf(app: App, component: Component, files: TFile[], cb: ToPdfCallback): Promise<void> {
        const dom = [];
        for (const file of files) {
            const content = await file.vault.cachedRead(file);

            const container = El(null, "div.markdown-preview-view.markdown-rendered");
            await MarkdownRenderer.render(app, content, container, file.path, component);
            dom.push(container);
        }

        await this.toPdf(cb, ...dom);
    }

    static async renderPdfPage(pdf: PDFDocumentProxy, index: number, canvas: HTMLCanvasElement, maxWidth: number) {
        const page = await pdf.getPage(index);

        // first, get the "default" (scale=1) page size to scale according to it
        const { width: pdfWidth, height: pdfHeight } = page.getViewport({ scale: 1 });
        const scale = maxWidth / pdfWidth;

        // then, get a new viewport, corrected for the scale
        const viewport = page.getViewport({ scale });

        // set the canvas "layout size" and scale (not the same as rendering size)
        canvas.style.width = `${pdfWidth}px`;
        canvas.style.height = `${pdfHeight}px`;
        canvas.style.setProperty('zoom', scale.toString());

        // set the canvas rendering size (e.g. the size of the texture it renders to)
        // 1 pixel on screen *must* correspond to 1 pixel in the texture or it'll look bad
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // get the canvas rendering context
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // actually render the page
        await page.render({ canvasContext: ctx, viewport }).promise;
    }
}
