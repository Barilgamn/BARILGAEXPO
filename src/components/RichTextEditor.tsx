import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'link'],
    ['clean'],
  ],
};

/**
 * Текст засахад тохиромжтой WYSIWYG editor (Quill). HTML гаргана.
 * Том бичих талбай, тохь тухтай фонт/мөр хоорондын зай, наалдсан toolbar.
 */
export const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  return (
    <div className="news-editor rounded-xl border border-gray-300 overflow-hidden bg-white shadow-sm">
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} placeholder={placeholder} />
      <style>{`
        .news-editor .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 5;
          background: #f9fafb;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 10px;
        }
        .news-editor .ql-container {
          border: none;
          font-family: inherit;
          font-size: 16px;
        }
        .news-editor .ql-editor {
          min-height: 380px;
          max-height: 60vh;
          overflow-y: auto;
          line-height: 1.75;
          padding: 20px 24px;
          color: #1f2937;
        }
        .news-editor .ql-editor p { margin-bottom: 0.85em; }
        .news-editor .ql-editor h2 { font-size: 1.6em; font-weight: 700; color: #1e3a8a; margin: 0.8em 0 0.4em; }
        .news-editor .ql-editor h3 { font-size: 1.3em; font-weight: 700; color: #1e3a8a; margin: 0.7em 0 0.3em; }
        .news-editor .ql-editor blockquote {
          border-left: 4px solid #fca5a5;
          padding-left: 14px;
          color: #4b5563;
          font-style: italic;
        }
        .news-editor .ql-editor a { color: #dc2626; text-decoration: underline; }
        .news-editor .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; left: 24px; }
      `}</style>
    </div>
  );
};
