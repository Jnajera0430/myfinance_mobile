import { gql } from '@apollo/client';
// ==================== FRAGMENTS ====================
export const CATEGORY_FRAGMENT = gql`
  fragment CategoryFields on Category {
    id
    name
    type
    icon
    color
  }
`;
// ==================== QUERIES ====================
export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      ...CategoryFields
    }
  }
  ${CATEGORY_FRAGMENT}
`;
export const CATEGORIES_BY_TYPE_QUERY = gql`
  query CategoriesByType($type: String!) {
    categoriesByType(type: $type) {
      ...CategoryFields
    }
  }
  ${CATEGORY_FRAGMENT}
`;
