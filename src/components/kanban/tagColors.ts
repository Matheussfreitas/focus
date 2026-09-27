import { TagsColor } from '#/generated/prisma/enums.ts'

export const TAG_COLOR_HEX: Record<TagsColor, string> = {
  [TagsColor.RED]: '#7E2020',
  [TagsColor.GREEN]: '#17453A',
  [TagsColor.BLUE]: '#1D396E',
  [TagsColor.YELLOW]: '#8A6D1D',
  [TagsColor.ORANGE]: '#6B3A1E',
  [TagsColor.PURPLE]: '#4B2E6B',
  [TagsColor.PINK]: '#5A1F33',
  [TagsColor.BROWN]: '#4A3728',
  [TagsColor.GRAY]: '#5D5344',
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
