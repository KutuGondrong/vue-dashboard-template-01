import TypographyTitle from './TypographyTitle.vue';
import TypographyText from './TypographyText.vue';
import TypographyParagraph from './TypographyParagraph.vue';
import TypographyCaption from './TypographyCaption.vue';
import TypographyLabel from './TypographyLabel.vue';
import TypographyOverline from './TypographyOverline.vue';

export const Typography = {
  Title: TypographyTitle,
  Text: TypographyText,
  Paragraph: TypographyParagraph,
  Caption: TypographyCaption,
  Label: TypographyLabel,
  Overline: TypographyOverline,
};

export const TYPOGRAPHY_COMPONENT_MAP = {
  title: 'Title',
  text: 'Text',
  paragraph: 'Paragraph',
  caption: 'Caption',
  label: 'Label',
  overline: 'Overline',
} as const;

export type {
  TypographyColor,
  TypographyWeight,
  TypographyAlign,
  TypographyLevel,
  TypographyComponent,
} from './typography.types';
