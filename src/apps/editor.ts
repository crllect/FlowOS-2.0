import icon from '../assets/icons/editor.png'
import { App } from '../types.ts'

import { fullEditor } from 'prism-code-editor/setups'
// this will also import markup, clike, javascript, typescript and jsx
import 'prism-code-editor/grammars/tsx'
import 'prism-code-editor/grammars/css-extras'
import 'prism-code-editor/grammars/markdown'
import 'prism-code-editor/grammars/python'

import { FlowWindow } from '../wm.ts'

interface EditorConfig {
  path: string
}

const fileLanguageMap: {
  [key: string]: string
} = {
  c: 'clike',
  cpp: 'clike',
  java: 'clike',
  cs: 'clike',
  ts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  tsx: 'tsx',
  html: 'html',
  md: 'markdown',
  css: 'css',
  xml: 'xml',
  py: 'python'
}

export default class EditorApp implements App {
  meta = {
    name: 'Editor',
    description: 'A simple editor app.',
    pkg: 'flow.editor',
    version: '1.0.0',
    icon
  }

  async open (data?: EditorConfig): Promise<FlowWindow> {
    const win = window.wm.createWindow({
      title: this.meta.name,
      icon: this.meta.icon,
      width: 500,
      height: 400
    })

    if (data != null) {
      win.setTitle(`Editor - ${data.path}`)

      win.content.style.display = 'flex'
      win.content.style.flexDirection = 'column'
      win.content.innerHTML = `
        <div style="padding: 5px;display: flex;align-items: center;gap: 5px;">
          <div id="file-open">File</div>
          <div id="edit-open">Edit</div>

          <div class="dropdown" id="file">
            <a id="save">
              <i class='bx bxs-save' style="font-size: 1.1rem;"></i>
              Save
            </a>
          </div>
          <div class="dropdown" id="edit">
            <a id="find">
              <i class='bx bxs-save' style="font-size: 1.1rem;"></i>
              Find
            </a>
          </div>
        </div>
        <div class="editor" style="flex:1;display:grid;overflow:scroll;"></div>
        <style>
        .dropdown {
          position: absolute;
          z-index: 100;
          width: 150px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 5px;
          padding: 5px;
          margin-top: 80px;
          background: var(--surface-0);
          transition: all 0.1s cubic-bezier(0.16, 1, 0.5, 1);
            
          transform: translateY(0.5rem);
          visibility: hidden;
          opacity: 0;
        }
        
        .show {
          transform: translateY(0rem);
          visibility: visible;
          opacity: 1;
        }

        .dropdown a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 10px;
          text-decoration: none;
          color: var(--text);
        }
        
        .dropdown a:hover {
          background-color: var(--base);
          color: white;
        }
        </style>
      `

      const fileBtn = win.content.querySelector('#file-open')
      const editBtn = win.content.querySelector('#edit-open')

      const toggleDropdown = (id: string): void => {
        const el = win.content.querySelector(`#${id}`)
        el?.classList.toggle('show')
      }

      fileBtn?.addEventListener('click', (e) => {
        e.stopPropagation()
        toggleDropdown('file')
      })

      editBtn?.addEventListener('click', (e) => {
        e.stopPropagation()
        toggleDropdown('edit')
      })

      win.content.addEventListener('click', () => {
        const file = (win.content.querySelector('#file') as HTMLElement)
        const edit = (win.content.querySelector('#edit') as HTMLElement)
        if (file.classList.contains('show')) {
          toggleDropdown('file')
        }
        if (edit.classList.contains('show')) {
          toggleDropdown('edit')
        }
      })

      const fileExtension = data.path.split('.').pop()?.toLowerCase() as string
      const language = fileLanguageMap[fileExtension] ?? 'text'

      const value = (await window.fs.promises.readFile(data.path)).toString()
      const editor = fullEditor(
        win.content.querySelector('.editor') as HTMLElement,
        {
          language,
          theme: 'github-dark',
          value
        }
      )

      const style = document.createElement('style')
      style.textContent = `
      .prism-code-editor {
        border-radius: 10px 10px 0 0;
        caret-color: var(--text);
        font-weight: 400;
        --editor__bg: var(--base);
        --widget__border: var(--mantle);
        --widget__bg: var(--crust);
        --widget__color: var(--text);
        --widget__color-active: var(--text);
        --widget__color-options: #8a99a8;
        --widget__bg-input: var(--mantle);
        --widget__bg-hover: #5a5d5e4f;
        --widget__bg-active: var(--base);
        --widget__focus-ring: var(--text);
        --search__bg-find: var(--surface-1)80;
        --widget__bg-error: #5a1d1d;
        --widget__error-ring: #be1100;
        --editor__bg-highlight: #636e7b1a;
        --editor__bg-selection-match: var(--surface-1)40;
        --editor__line-number: #636e7b;
        --editor__line-number-active: #adbac7;
        --bg-guide-indent: var(--surface-0);
        overflow: visible;
      }
      .prism-search * {
        font-family: 'Satoshi', sans-serif;
      }
      `
      editor.scrollContainer.appendChild(style);
      (win.content.querySelector('#find') as HTMLElement).onclick = () => {
        editor.extensions.searchWidget?.open()
      }
      (win.content.querySelector('#save') as HTMLElement).onclick = async () => {
        await window.fs.promises.writeFile(data.path, editor.value)
      }
    } else {
      await window.flow.openApp('flow.files')
      setTimeout(() => {
        win.close()
      }, 10)
    }

    return win
  }
}
