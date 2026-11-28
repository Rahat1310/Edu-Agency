import campusPhotoCatalogue from "./university-photo-catalogue.json";

/** Campus photography is kept separate from course and admissions data. */
export type UniversityVisual = {
  src: string;
  alt: string;
  source: string;
  credit: string;
  license?: string;
  licenseLabel?: string;
};

export const universityVisuals: Record<string, UniversityVisual> = {
  ...campusPhotoCatalogue,
  "Kuala Lumpur University of Science and Technology (KLUST)": {
    src: "/images/universities/klust.webp",
    alt: "Kuala Lumpur University of Science and Technology campus entrance",
    source: "https://klust.edu.my/",
    credit: "Kuala Lumpur University of Science and Technology",
  },
  "ALFA University College": {
    src: "/images/universities/alfa.webp",
    alt: "ALFA University College building",
    source: "https://alfa.edu.my/",
    credit: "ALFA University College",
  },
  "Asia Pacific University (APU) / APIIT": {
    src: "/images/universities/apu.webp",
    alt: "Asia Pacific University campus in Malaysia",
    source: "https://www.apu.edu.my/campus",
    credit: "Asia Pacific University",
  },
  "Asia e University (AeU)": {
    src: "/images/universities/aeu.webp",
    alt: "Asia e University campus building",
    source: "https://aeu.edu.my/discover/campus-location/",
    credit: "Asia e University",
  },
  "Beihang University": {
    src: "/images/universities/beihang.webp",
    alt: "Beihang University's modern campus courtyard",
    source: "https://ev.buaa.edu.cn/About/University_Motto___Spirit.htm",
    credit: "Beihang University",
  },
  "Xiamen University": {
    src: "/images/china-xiamen-campus.webp",
    alt: "Xiamen University's Jiageng buildings beside Furong Lake",
    source:
      "https://commons.wikimedia.org/wiki/File:Xiamen_University_07076-Xiamen_(48814339602).jpg",
    credit: "xiquinhosilva · CC BY 2.0 · cropped",
    license: "https://creativecommons.org/licenses/by/2.0/",
  },
  "Huazhong University of Science and Technology": {
    src: "/images/china-hust-campus.jpg",
    alt: "Huazhong University of Science and Technology campus in Wuhan",
    source:
      "https://iso.hust.edu.cn/Services_Information/Campus_Facilities/Housing___Dining.htm",
    credit: "Huazhong University of Science and Technology",
  },
  "Sunway University / Sunway education programmes": {
    src: "/images/malaysia-sunway-campus.webp",
    alt: "Sunway University's curved campus building and landscaped grounds",
    source:
      "https://commons.wikimedia.org/wiki/File:Cmglee_Sunway_University_new_building.jpg",
    credit: "Cmglee · CC BY-SA 4.0 · cropped",
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};

// Destination photographs are explicitly identified as such in the card.
// They are never presented as photographs of a different university.
export const universityDestinationVisuals: Record<string, UniversityVisual> = {
  china: {
    src: "/images/china-shanghai-skyline.webp",
    alt: "Shanghai skyline in China; destination photograph",
    source:
      "https://commons.wikimedia.org/wiki/File:Shanghai_skyline_at_night.jpg",
    credit: "Ernest Jourdier · CC BY 4.0 · cropped",
    license: "https://creativecommons.org/licenses/by/4.0/",
  },
  malaysia: {
    src: "/images/malaysia-kuala-lumpur.webp",
    alt: "Kuala Lumpur skyline in Malaysia; destination photograph",
    source:
      "https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_skyline_at_night.jpg",
    credit: "Lah sadzik · CC BY-SA 4.0 · cropped",
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};
