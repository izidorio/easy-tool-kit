import { ComponentProps, ReactNode, useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactCopyToClipboard from 'react-copy-to-clipboard';
import { Copy, CopyCheck } from 'lucide-react';

interface Props extends ComponentProps<'div'> {
  children: ReactNode;
  text?: string;
}

export function CopyToClipboard({ children, text }: Props) {
  const [show, setShow] = useState(false);
  const title = text ? text : ReactDOMServer.renderToStaticMarkup(<>{children}</>);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, 1000 * 2);

    return () => {
      clearTimeout(timeout);
    };
  }, [show]);

  if (title === '') {
    return <span className="flex items-center truncate">{children}</span>;
  }

  return (
    <span className="flex items-center truncate">
      <p className="text-md">{children}</p>
      <ReactCopyToClipboard text={title} onCopy={() => setShow(true)}>
        <span title="copiar para área de transferência" onClick={(e) => e.stopPropagation()}>
          {show && <CopyCheck strokeWidth={1} className="ml-1 h-4 w-4 shrink-0 text-green-600" />}
          {!show && <Copy strokeWidth={1} className="ml-1 h-4 w-4 shrink-0 cursor-pointer" />}
        </span>
      </ReactCopyToClipboard>
    </span>
  );
}
