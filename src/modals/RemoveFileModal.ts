import { App, FuzzySuggestModal, TFile } from "obsidian";
import { PdfPreviewView } from "../preview/PdfPreviewView";

export default class RemoveFileModal extends FuzzySuggestModal<TFile> {
    view: PdfPreviewView;

    constructor(app: App, view: PdfPreviewView) {
        super(app);
        this.view = view;
    }

    getItems(): TFile[] {
        return this.view.files;
    }

    getItemText(item: TFile): string {
        return item.name;
    }

    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
        this.view.removeFile(item);
    }
}
