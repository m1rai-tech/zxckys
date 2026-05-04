import { generatePath, matchPath } from 'react-router-dom'

export const ROUTES = {
  home: '/',
  marketplace: '/marketplace',
  category: '/category/:categoryId',
  listing: '/listing/:listingId',
  seller: '/seller/:sellerId',
  favorites: '/favorites',
  chat: '/chat',
  settings: '/settings',
  profile: '/profile/:profileId',
  myProfile: '/profile/me',
  create: '/create',
  admin: '/admin',
}

export function buildCategoryPath(categoryId) {
  return generatePath(ROUTES.category, { categoryId })
}

export function buildListingPath(listingId) {
  return generatePath(ROUTES.listing, { listingId })
}

export function buildSellerPath(sellerId) {
  return generatePath(ROUTES.seller, { sellerId })
}

export function buildProfilePath(profileId) {
  return generatePath(ROUTES.profile, { profileId })
}

export function resolveRouteState(pathname) {
  if (pathname === ROUTES.home || pathname === ROUTES.marketplace) {
    return { page: 'home' }
  }

  const categoryMatch = matchPath({ path: ROUTES.category, end: true }, pathname)
  if (categoryMatch?.params?.categoryId) {
    return { page: 'category', categoryId: categoryMatch.params.categoryId }
  }

  const listingMatch = matchPath({ path: ROUTES.listing, end: true }, pathname)
  if (listingMatch?.params?.listingId) {
    return { page: 'product', listingId: listingMatch.params.listingId }
  }

  const sellerMatch = matchPath({ path: ROUTES.seller, end: true }, pathname)
  if (sellerMatch?.params?.sellerId) {
    return { page: 'seller', sellerId: sellerMatch.params.sellerId }
  }

  if (pathname === ROUTES.favorites) return { page: 'favorites' }
  if (pathname === ROUTES.chat) return { page: 'account' }
  if (pathname === ROUTES.settings || pathname === ROUTES.myProfile) return { page: 'profile' }
  if (pathname === ROUTES.create) return { page: 'create' }
  if (pathname === ROUTES.admin) return { page: 'admin' }

  const profileMatch = matchPath({ path: ROUTES.profile, end: true }, pathname)
  if (profileMatch?.params?.profileId) {
    return { page: 'profile', profileId: profileMatch.params.profileId }
  }

  return { page: 'home' }
}
