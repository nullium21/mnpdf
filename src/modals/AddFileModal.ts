import { FuzzySuggestModal, TFile, App } from "obsidian";

import { PdfPreviewView } from "../preview/PdfPreviewView";

export default class AddFileModal extends FuzzySuggestModal<TFile> {
    view: PdfPreviewView;

    constructor(app: App, view: PdfPreviewView) {
        super(app);
        this.view = view;
    }

    getItems(): TFile[] {
        return this.app.vault.getMarkdownFiles();
    }

    getItemText(item: TFile): string {
        return item.name;
    }

    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
        this.view.addFile(item);
    }
}
