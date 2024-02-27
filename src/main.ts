import { Plugin } from 'obsidian';
import { PdfPreviewView } from './preview/PdfPreviewView';
import PdfSidebar from './sidebar/PdfSidebar';

export default class PdfPlugin extends Plugin {

	async onload() {
        this.registerView(PdfPreviewView.VIEW_TYPE, leaf => new PdfPreviewView(leaf));
        this.registerView(PdfSidebar.VIEW_TYPE, leaf => new PdfSidebar(leaf));
        this.addRibbonIcon("book-text", "PDF Export", () => this.showPreview());
	}

	onunload() {

	}

    async showPreview() {
        const { workspace } = this.app;
        const leaf = workspace.createLeafInTabGroup();

        await leaf.setViewState({ type: PdfPreviewView.VIEW_TYPE, active: true });
        workspace.revealLeaf(leaf);
    }
}
