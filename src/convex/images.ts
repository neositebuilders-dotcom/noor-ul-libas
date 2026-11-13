/**
 * Catalog imagery. These are remote editorial photographs used for the starter
 * collection. Administrators can replace every image from the dashboard, either
 * by uploading a file (stored in Convex storage) or by pasting an image URL.
 */
const ids = {
  heroOne: "1610030469983-98e550d6193c",
  heroTwo: "1595777457583-95e059d581b8",
  heroThree: "1617137968427-85924c800a22",
  bannerOne: "1490481651871-ab68de25d43d",
  bannerTwo: "1554568218-0f1715e72254",
  catUnstitched: "1445205170230-053b83016050",
  catReadyToWear: "1483985988355-763728e1935b",
  catTwoPiece: "1496747611176-843222e1e57c",
  catThreePiece: "1515886657613-9f3515b0c78f",
  catLawn: "1509631179647-0177331693ae",
  catChiffon: "1551232864-3f0890e580d9",
  catLuxury: "1585487000160-6ebcfceb0d03",
  catFestive: "1581338834647-b0fb40704e21",
  socialOne: "1441986300917-64674bd600d8",
  socialTwo: "1469334031218-e382a71b716b",
  socialThree: "1485968579580-b6d095142e6e",
  socialFour: "1492707892479-7bc8d5a4ee93",
  socialFive: "1539109136881-3be0616acf4b",
  socialSix: "1596755094514-f87e34085b2c",
} as const;

export function imageUrl(id: string, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const IMAGES = {
  heroOne: imageUrl(ids.heroOne, 2000),
  heroTwo: imageUrl(ids.heroTwo, 2000),
  heroThree: imageUrl(ids.heroThree, 2000),
  bannerOne: imageUrl(ids.bannerOne, 1600),
  bannerTwo: imageUrl(ids.bannerTwo, 1600),
  catUnstitched: imageUrl(ids.catUnstitched, 900),
  catReadyToWear: imageUrl(ids.catReadyToWear, 900),
  catTwoPiece: imageUrl(ids.catTwoPiece, 900),
  catThreePiece: imageUrl(ids.catThreePiece, 900),
  catLawn: imageUrl(ids.catLawn, 900),
  catChiffon: imageUrl(ids.catChiffon, 900),
  catLuxury: imageUrl(ids.catLuxury, 900),
  catFestive: imageUrl(ids.catFestive, 900),
} as const;

export const GALLERY_IMAGES: string[] = [
  imageUrl(ids.socialOne, 700),
  imageUrl(ids.socialTwo, 700),
  imageUrl(ids.socialThree, 700),
  imageUrl(ids.socialFour, 700),
  imageUrl(ids.socialFive, 700),
  imageUrl(ids.socialSix, 700),
];

/** Fabric / atelier shots spread across the seeded product catalogue. */
export const PRODUCT_IMAGES: string[] = [
  imageUrl("1610030469983-98e550d6193c", 1000),
  imageUrl("1583391733956-3750e0ff4e8b", 1000),
  imageUrl("1594633312681-425c7b97ccd1", 1000),
  imageUrl("1617137968427-85924c800a22", 1000),
  imageUrl("1595777457583-95e059d581b8", 1000),
  imageUrl("1618354691373-d851c5c3a990", 1000),
  imageUrl("1524504388940-b1c1722653e1", 1000),
  imageUrl("1496747611176-843222e1e57c", 1000),
  imageUrl("1483985988355-763728e1935b", 1000),
  imageUrl("1445205170230-053b83016050", 1000),
  imageUrl("1485968579580-b6d095142e6e", 1000),
  imageUrl("1492707892479-7bc8d5a4ee93", 1000),
  imageUrl("1441986300917-64674bd600d8", 1000),
  imageUrl("1469334031218-e382a71b716b", 1000),
  imageUrl("1490481651871-ab68de25d43d", 1000),
  imageUrl("1539109136881-3be0616acf4b", 1000),
  imageUrl("1515886657613-9f3515b0c78f", 1000),
  imageUrl("1509631179647-0177331693ae", 1000),
  imageUrl("1551232864-3f0890e580d9", 1000),
  imageUrl("1554568218-0f1715e72254", 1000),
  imageUrl("1581044777550-4cfa60707c03", 1000),
  imageUrl("1596755094514-f87e34085b2c", 1000),
  imageUrl("1523381210434-271e8be1f52b", 1000),
  imageUrl("1585487000160-6ebcfceb0d03", 1000),
  imageUrl("1581338834647-b0fb40704e21", 1000),
  imageUrl("1558769132-cb1aea458c5e", 1000),
];
