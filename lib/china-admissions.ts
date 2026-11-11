import type { ProgramLevel } from "@/db/schema";

export const CHINA_ADMISSION_SOURCES = {
  zju: "https://iczu.zju.edu.cn/admissionsen/wpplicationwwuide/list.htm",
  zjuGraduate: "https://iczu.zju.edu.cn/admissionsen/",
  nmu: "https://sie.njmu.edu.cn/17746/list.htm",
  hit: "https://studyathit.hit.edu.cn/18337/list.htm",
  wut: "https://sie.whut.edu.cn/",
  nenu: "https://iso.nenu.edu.cn/",
} as const;

export function chinaAdmissionsUrl(
  universityName: string,
  level?: ProgramLevel,
) {
  if (universityName.startsWith("Zhejiang University"))
    return level === "master" || level === "phd"
      ? CHINA_ADMISSION_SOURCES.zjuGraduate
      : CHINA_ADMISSION_SOURCES.zju;
  if (universityName === "Nanjing Medical University")
    return CHINA_ADMISSION_SOURCES.nmu;
  if (universityName.startsWith("Harbin Institute of Technology"))
    return CHINA_ADMISSION_SOURCES.hit;
  if (universityName.startsWith("Wuhan University of Technology"))
    return CHINA_ADMISSION_SOURCES.wut;
  if (universityName.startsWith("Northeast Normal University"))
    return CHINA_ADMISSION_SOURCES.nenu;
  return "https://www.campuschina.org/";
}
