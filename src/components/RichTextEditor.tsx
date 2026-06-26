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

/** Орчин үеийн WYSIWYG editor (Quill). HTML гаргана. */
export const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  return (
    <div className="bg-white rounded-lg [&_.ql-container]:min-h-[260px] [&_.ql-container]:text-base [&_.ql-editor]:min-h-[260px]">
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} placeholder={placeholder} />
    </div>
  );
};
