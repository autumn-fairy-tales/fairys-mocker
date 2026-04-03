import CodeEditor from '@uiw/react-textarea-code-editor';

export interface JSONEditProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const JSONEdit = (props: JSONEditProps) => {
  const { value, onChange, placeholder, className } = props;

  return <CodeEditor
    value={value}
    language="json"
    placeholder={placeholder}
    onChange={(evn) => onChange?.(evn.target.value)}
    padding={15}
    className={className}
    style={{
      fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
      minHeight: 280,
    }}
  />
}