import { ItemView } from "obsidian";

export default class PdfSidebar extends ItemView {
    static VIEW_TYPE = "pdf-preview-sidebar";

    getViewType(): string {
        return PdfSidebar.VIEW_TYPE;
    }

    getDisplayText(): string {
        return "PDF Preview Sidebar";
    }

    getIcon(): string {
        return "book-text";
    }
}
