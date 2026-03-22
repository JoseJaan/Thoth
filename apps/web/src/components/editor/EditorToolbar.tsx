import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  TableIcon,
  CodeSquare,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, isActive, icon, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-indigo-100 text-indigo-600"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-1" />;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("URL da imagem:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const s = 15;

  return (
    <div className="px-8 py-2 flex items-center gap-0.5 flex-wrap border-b border-slate-100">
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        icon={<Undo2 size={s} />}
        title="Desfazer"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        icon={<Redo2 size={s} />}
        title="Refazer"
      />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        icon={<Heading1 size={s} />}
        title="Titulo 1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        icon={<Heading2 size={s} />}
        title="Titulo 2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        icon={<Heading3 size={s} />}
        title="Titulo 3"
      />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        icon={<Bold size={s} />}
        title="Negrito"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        icon={<Italic size={s} />}
        title="Italico"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        icon={<UnderlineIcon size={s} />}
        title="Sublinhado"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        icon={<Strikethrough size={s} />}
        title="Riscado"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        icon={<Highlighter size={s} />}
        title="Destacar"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        icon={<Code size={s} />}
        title="Codigo inline"
      />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon={<List size={s} />}
        title="Lista"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon={<ListOrdered size={s} />}
        title="Lista numerada"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        icon={<ListChecks size={s} />}
        title="Checklist"
      />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        icon={<Quote size={s} />}
        title="Citacao"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        icon={<CodeSquare size={s} />}
        title="Bloco de codigo"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        icon={<Minus size={s} />}
        title="Linha horizontal"
      />

      <Divider />

      <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} icon={<LinkIcon size={s} />} title="Link" />
      <ToolbarButton onClick={addImage} icon={<ImageIcon size={s} />} title="Imagem" />
      <ToolbarButton onClick={addTable} icon={<TableIcon size={s} />} title="Tabela" />

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        icon={<AlignLeft size={s} />}
        title="Alinhar esquerda"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        icon={<AlignCenter size={s} />}
        title="Centralizar"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        icon={<AlignRight size={s} />}
        title="Alinhar direita"
      />
    </div>
  );
}
