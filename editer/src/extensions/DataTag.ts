import { Mark, mergeAttributes } from '@tiptap/core';

export interface DataTagOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dataTag: {
      /**
       * 선택 영역에 데이터 태그를 설정합니다.
       */
      setDataTag: (attributes: { tagData: string }) => ReturnType;
      /**
       * 선택 영역의 데이터 태그를 제거합니다.
       */
      unsetDataTag: () => ReturnType;
    };
  }
}

export const DataTag = Mark.create<DataTagOptions>({
  name: 'dataTag',

  // 이 마크가 다른 마크와 함께 공존할 수 있도록 합니다.
  inclusive: true,

  // 태그 데이터를 저장할 '속성'을 정의합니다.
  addAttributes() {
    return {
      tagData: {
        default: null,
        // HTML로 렌더링될 때 <span data-tag="..."> 형태로 저장됩니다.
        renderHTML: attributes => {
          if (!attributes.tagData) {
            return {};
          }
          return { 'data-tag': attributes.tagData };
        },
        // HTML을 파싱할 때 data-tag 속성을 읽어옵니다.
        parseHTML: element => element.getAttribute('data-tag'),
      },
    };
  },

  parseHTML() {
    return [
      {
        // data-tag 속성을 가진 모든 span 태그를 이 마크로 인식합니다.
        tag: 'span[data-tag]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // 중요한 부분: 아무런 스타일도 적용하지 않은 일반 <span> 태그로 렌더링합니다.
    // 이 때문에 화면에서는 보이지 않게 됩니다.
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setDataTag: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes);
      },
      unsetDataTag: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});