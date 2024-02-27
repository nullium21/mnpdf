import * as remote from "@electron/remote";
import { type SaveDialogOptions } from "electron";
import { DataAdapter, normalizePath, setIcon } from "obsidian";

export const El = <K extends keyof HTMLElementTagNameMap>(
    parent: HTMLElement | null,
    tag: K | `${K}.${string}`,
    opt?: ((el: HTMLElementTagNameMap[K]) => void) | {
        icon?: string;
        text?: string;
        attr?: { [k: string]: any };
        cb?: (el: HTMLElementTagNameMap[K]) => void;
    } | HTMLElement[]
): HTMLElementTagNameMap[K] => {
    const [tagname, ...classes] = tag.split('.');
    const el = document.createElement(tagname as K);

    el.addClasses(classes);
    
    if (typeof opt === 'function') {
        opt(el);
    } else if (Array.isArray(opt)) {
        el.append(...opt);
    } else {
        opt?.attr && el.setAttrs(opt.attr);
        opt?.icon && setIcon(el, opt.icon);
        opt?.text && (el.appendText(opt.text));
        opt?.cb?.(el);
    }

    parent?.appendChild(el);
    return el;
};

export const Icon = (
    parent: HTMLElement | null,
    icon: string,
    click?: (this: HTMLElement, ev: MouseEvent) => any
): HTMLElement => {
    const el = document.createElement('a');

    el.addClass('clickable-icon');
    setIcon(el, icon);

    click && el.onClickEvent(click);

    parent?.appendChild(el);
    return el;
};

export const saveFile = async (data: Uint8Array, adapter: DataAdapter, opts?: SaveDialogOptions): Promise<string | null> => {
    const { canceled, filePath } = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), opts || {
        defaultPath: adapter.basePath
    });
    if (canceled || !filePath) return null;
    await remote.require("node:fs/promises").writeFile(filePath, data, { flush: true });
    return filePath;
};
