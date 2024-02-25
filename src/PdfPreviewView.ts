import { ItemView, Menu, Notice, TFile, WorkspaceLeaf, loadPdfJs } from "obsidian";
import PdfRenderer from "./PdfRenderer";
import { El, saveFile } from "./util";

import * as PdfJs from "pdfjs-dist";

import "./styles.css";
import AddFileModal from "./AddFileModal";
import RemoveFileModal from "./RemoveFileModal";

declare module "obsidian" {
    interface View {
        actionsEl: HTMLElement;
    }
}

export class PdfPreviewView extends ItemView {
    static VIEW_TYPE = "pdf-preview";

    pdfData: Uint8Array | null = null;
    files: TFile[] = [];

    pdfDoc: PdfJs.PDFDocumentProxy | null = null;
    pageNumber: number = 1;
    
    pageNumberEl: HTMLInputElement;
    maxPagesEl: HTMLElement;
    pageEl: HTMLCanvasElement;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return PdfPreviewView.VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Preview PDF";
    }

    async onOpen() {
        this.actionsEl.prepend(
            El(null, "input.pdf-page-input", { attr: { "type": "number" }, cb: input => {
                this.pageNumberEl = input;
                input.addEventListener("change", ev => {
                    if (!this.setPageNumber(input.valueAsNumber)) {
                        ev.preventDefault();
                        input.value = this.pageNumber.toString();
                    }
                });
            } }),
            El(null, "span.pdf-page-numbers", span => {
                this.maxPagesEl = span;
            })
        );

        El(this.contentEl, "canvas.pdf-page", el => this.pageEl = el);
    }

    onPaneMenu(menu: Menu, source: string): void {
        if (source === 'more-options') {
            menu.addItem(item => item
                .setIcon('save')
                .setTitle("Save PDF")
                .onClick(() => this.save()));
            
            menu.addItem(item => item
                .setIcon('refresh-cw')
                .setTitle("Refresh preview")
                .onClick(() => this.refresh()));
            
            menu.addSeparator();
    
            menu.addItem(item => item
                .setIcon('file-plus')
                .setTitle("Add file")
                .onClick(() => {
                    new AddFileModal(this.app, this).open();
                }));
            
            menu.addItem(item => item
                .setIcon('file-x')
                .setTitle("Remove file")
                .onClick(() => {
                    new RemoveFileModal(this.app, this).open();
                }));
            
            menu.addSeparator();

            menu.addItem(item => item
                .setIcon('arrow-left')
                .setTitle("Previous page")
                .onClick(() => {
                    this.setPageNumber(this.pageNumber - 1, true);
                }))

            menu.addItem(item => item
                .setIcon('arrow-right')
                .setTitle("Next page")
                .onClick(() => {
                    this.setPageNumber(this.pageNumber + 1, true);
                }));
        }
    }

    setPageNumber(pageNumber: number, updateInput?: boolean): boolean {
        if (!this.pdfDoc) return false;
        if (pageNumber < 1 || pageNumber > this.pdfDoc.numPages) return false;
        this.pageNumber = pageNumber;
        this.rerenderPage();
        if (updateInput) this.pageNumberEl.value = pageNumber.toString();
        return true;
    }

    async addFile(file: TFile) {
        this.files.push(file);
        await this.refresh();
        await this.rerenderPage();
    }

    async removeFile(file: TFile) {
        this.files.remove(file);
        await this.refresh();
        await this.rerenderPage();
    }

    async save() {
        if (!this.pdfData) return;
        const filePath = await saveFile(this.pdfData, this.app.vault.adapter, {
            filters: [
                { name: "PDF Files", extensions: ["pdf"] }
            ]
        });
        if (filePath) new Notice(`Saved PDF to ${filePath}!`);
    }

    async refresh() {
        if (this.files.length) {
            this.pdfData = await PdfRenderer.filesToPdf(this.app, this, this.files);

            const pdfjs: typeof PdfJs = await loadPdfJs();
            const doc = await pdfjs.getDocument(this.pdfData).promise;

            this.pdfDoc = doc;

            this.maxPagesEl.innerText = `of ${doc.numPages}`;
        } else {
            this.pdfData = this.pdfDoc = null;
            this.maxPagesEl.innerText = '';
            this.pageEl.removeClass('page-with-content');
        }
    }

    async rerenderPage() {
        if (!this.pdfDoc || !this.pageEl.parentElement) return;
        this.pageNumberEl.value = this.pageNumber.toString();
        await PdfRenderer.renderPdfPage(this.pdfDoc, this.pageNumber, this.pageEl, this.pageEl.parentElement.innerWidth);
        this.pageEl.addClass('page-with-content');
    }
}
