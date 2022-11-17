// Import React dependencies.
import React, {
  useCallback,
  useState,
} from 'react';
// Import the Slate editor factory.
import {
  createEditor,
  Editor,
  Text,
  Transforms,
  Descendant,
  Element as SlateElement,
} from 'slate';

// Import the Slate components and React plugin.
import {
  Slate,
  Editable,
  withReact,
  useSlate,
} from 'slate-react';
import isHotkey from 'is-hotkey';
import { Button } from 'react-bootstrap';
import useSelection from './hooks/useSelection';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] =
      Editor.nodes(editor, {
        match: (n) =>
          n.bold === true,
        universal: true,
      });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] =
      Editor.nodes(editor, {
        match: (n) =>
          n.type === 'code',
      });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive =
      CustomEditor.isBoldMarkActive(
        editor
      );
    Transforms.setNodes(
      editor,
      {
        bold: isActive
          ? null
          : true,
      },
      {
        match: (n) =>
          Text.isText(n),
        split: true,
      }
    );
  },

  toggleCodeBlock(editor) {
    const isActive =
      CustomEditor.isCodeBlockActive(
        editor
      );
    Transforms.setNodes(
      editor,
      {
        type: isActive
          ? null
          : 'code',
      },
      {
        match: (n) =>
          Editor.isBlock(
            editor,
            n
          ),
      }
    );
  },
};

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'A line of text in a paragraph.',
      },
    ],
  },
];

const App = () => {
  const [
    document,
    updateDocument,
  ] = useState(initialValue);
  const onChange =
    updateDocument;
  const [editor] = useState(
    () =>
      withReact(
        createEditor()
      )
  );

  const renderElement =
    useCallback((props) => {
      switch (
        props.element.type
      ) {
        case 'code':
          return (
            <CodeElement
              {...props}
            />
          );
        default:
          return (
            <DefaultElement
              {...props}
            />
          );
      }
    }, []);

  const renderLeaf =
    useCallback((props) => {
      return (
        <Leaf {...props} />
      );
    }, []);

  const [
    selection,
    setSelection,
  ] = useSelection(editor);

  const onChangeHandler =
    useCallback(
      (document) => {
        onChange(document);
        setSelection(
          editor.selection
        );
      },
      [
        editor.selection,
        onChange,
        setSelection,
      ]
    );

  return (
    <>
      <Button>Bold</Button>
      <Slate
        editor={editor}
        value={initialValue}
        onChange={
          onChangeHandler
        }>
        <Editable
          renderElement={
            renderElement
          }
          renderLeaf={
            renderLeaf
          }
          onKeyDown={(
            event
          ) => {
            if (
              !event.ctrlKey
            ) {
              return;
            }

            // Replace the `onKeyDown` logic with our new commands.
            switch (
              event.key
            ) {
              case '`': {
                event.preventDefault();
                CustomEditor.toggleCodeBlock(
                  editor
                );
                break;
              }

              case 'b': {
                event.preventDefault();
                CustomEditor.toggleBoldMark(
                  editor
                );
                break;
              }
            }
          }}
        />
      </Slate>
    </>
  );
};

const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf
          .bold
          ? 'bold'
          : 'normal',
      }}>
      {props.children}
    </span>
  );
};

const CodeElement = (
  props
) => {
  return (
    <pre
      {...props.attributes}>
      <code>
        {props.children}
      </code>
    </pre>
  );
};

const DefaultElement = (
  props
) => {
  return (
    <p {...props.attributes}>
      {props.children}
    </p>
  );
};

export default App;
