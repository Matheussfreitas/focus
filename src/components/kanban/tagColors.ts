import { TagsColor } from '#/generated/prisma/enums.ts'

export const TAG_COLOR_HEX: Record<TagsColor, string> = {
  [TagsColor.RED]: 'var(--color-tag-red)',
  [TagsColor.GREEN]: 'var(--color-tag-green)',
  [TagsColor.BLUE]: 'var(--color-tag-blue)',
  [TagsColor.YELLOW]: 'var(--color-tag-yellow)',
  [TagsColor.ORANGE]: 'var(--color-tag-orange)',
  [TagsColor.PURPLE]: 'var(--color-tag-purple)',
  [TagsColor.PINK]: 'var(--color-tag-pink)',
  [TagsColor.BROWN]: 'var(--color-tag-brown)',
  [TagsColor.GRAY]: 'var(--color-tag-gray)',
}

export const TAG_COLOR_ORDER: TagsColor[] = [
  TagsColor.RED,
  TagsColor.ORANGE,
  TagsColor.YELLOW,
  TagsColor.GREEN,
  TagsColor.BLUE,
  TagsColor.PURPLE,
  TagsColor.PINK,
  TagsColor.BROWN,
  TagsColor.GRAY,
]
