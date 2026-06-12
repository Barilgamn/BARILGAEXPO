import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
// ⚠️ Vercel функц нь `api/` гадуурх (../src/*) файл болон тусдаа .json-ийг найдвартай
// bundle хийдэггүй тул booth өгөгдлийг ЭНД ШУУД (inline) агуулна — бүрэн self-contained.

type Booth = {
  id: string; section: string; area: number; pricePerM2: number;
  category: 'standard' | 'supporting' | 'sponsor' | 'b' | 'g'; status: string; company: string;
};
const booths: Booth[] = [{"id":"A1","section":"A","area":21,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A2","section":"A","area":12,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A3","section":"A","area":15,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A4","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Юнайтед Инженеринг ХХК"},{"id":"A5","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Langfang Xinduoli Energy-Saving Technology Co., Ltd."},{"id":"A6","section":"A","area":27,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A7","section":"A","area":15,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A8","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A9","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A10","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A11","section":"A","area":15,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A12","section":"A","area":27,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A13","section":"A","area":15,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A14","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A15","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A16","section":"A","area":21,"pricePerM2":510000,"category":"sponsor","status":"occupied","company":"ДЕЛЬТА ЭЛЕВАТОР ХХК"},{"id":"A17","section":"A","area":24,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A18","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A19","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Gary /CHINA HY GLOBAL EXHIBITION CO.,LTD/"},{"id":"A20","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"OCEAN BOND LLC / ТЭНЭГЭР"},{"id":"A21","section":"A","area":24,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A22","section":"A","area":15,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A23","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A24","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A25","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A26","section":"A","area":18,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Grey /SHANDONG HARMONY INTERNATIONAL BUSINESS CO., LTD/"},{"id":"A27","section":"A","area":27,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A28","section":"A","area":12,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A29","section":"A","area":25,"pricePerM2":460000,"category":"supporting","status":"available","company":""},{"id":"A30","section":"A","area":12,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Ella /CHINA KIRIN EXHIBITION CO., LTD/"},{"id":"A31","section":"A","area":12,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Ella /CHINA KIRIN EXHIBITION CO., LTD/"},{"id":"A32","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Grey /SHANDONG HARMONY INTERNATIONAL BUSINESS CO., LTD/"},{"id":"A33","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Grey /SHANDONG HARMONY INTERNATIONAL BUSINESS CO., LTD/"},{"id":"A34","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Ella /CHINA KIRIN EXHIBITION CO., LTD/"},{"id":"A35","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Ella /CHINA KIRIN EXHIBITION CO., LTD/"},{"id":"A36","section":"A","area":25,"pricePerM2":460000,"category":"supporting","status":"available","company":""},{"id":"A37","section":"A","area":6,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Gary /CHINA HY GLOBAL EXHIBITION CO.,LTD/"},{"id":"A38","section":"A","area":6,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Gary /CHINA HY GLOBAL EXHIBITION CO.,LTD/"},{"id":"A39","section":"A","area":6,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Gary /CHINA HY GLOBAL EXHIBITION CO.,LTD/"},{"id":"A40","section":"A","area":6,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Gary /CHINA HY GLOBAL EXHIBITION CO.,LTD/"},{"id":"A41","section":"A","area":8,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Gary /CHINA HY GLOBAL EXHIBITION CO.,LTD/"},{"id":"A42","section":"A","area":8,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Gary /CHINA HY GLOBAL EXHIBITION CO.,LTD/"},{"id":"A43","section":"A","area":30,"pricePerM2":460000,"category":"supporting","status":"available","company":""},{"id":"A44","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A45","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A46","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"ГУ АН ДА КАРКАЗ"},{"id":"A47","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A48","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"МЕТРОПЛАСТ ХХК"},{"id":"A49","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A50","section":"A","area":30,"pricePerM2":460000,"category":"supporting","status":"available","company":""},{"id":"A51","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A52","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A53","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A54","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A55","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A56","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A57","section":"A","area":36,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A58","section":"A","area":36,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A59","section":"A","area":30,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A60","section":"A","area":30,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A61","section":"A","area":36,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A62","section":"A","area":16,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A63","section":"A","area":16,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A64","section":"A","area":16,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A65","section":"A","area":32,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A66","section":"A","area":16,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A67","section":"A","area":16,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A68","section":"A","area":16,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A69","section":"A","area":36,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A70","section":"A","area":36,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A71","section":"A","area":30,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A72","section":"A","area":30,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A73","section":"A","area":36,"pricePerM2":510000,"category":"sponsor","status":"available","company":""},{"id":"A74","section":"A","area":36,"pricePerM2":460000,"category":"supporting","status":"available","company":""},{"id":"A75","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A76","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A77","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Shenyang Huiming Wood Industry LLC"},{"id":"A78","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A79","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A80","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"reserved","company":""},{"id":"A81","section":"A","area":36,"pricePerM2":460000,"category":"supporting","status":"available","company":""},{"id":"A82","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A83","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"Улаанбаатар Дизайн Центр ХХК"},{"id":"A84","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A85","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A86","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A87","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A88","section":"A","area":36,"pricePerM2":460000,"category":"supporting","status":"available","company":""},{"id":"A89","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"ФЭЙР ВИ ХХК"},{"id":"A90","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A91","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A92","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A93","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A94","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A95","section":"A","area":36,"pricePerM2":460000,"category":"supporting","status":"available","company":""},{"id":"A96","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A97","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A98","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A99","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A100","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"available","company":""},{"id":"A101","section":"A","area":9,"pricePerM2":420000,"category":"standard","status":"occupied","company":"“СЭНД ЭМ ЭН ББСБ” ХХК"},{"id":"B1","section":"B","area":14,"pricePerM2":420000,"category":"b","status":"reserved","company":""},{"id":"B2","section":"B","area":8,"pricePerM2":420000,"category":"b","status":"reserved","company":""},{"id":"B3","section":"B","area":6,"pricePerM2":420000,"category":"b","status":"reserved","company":""},{"id":"B4","section":"B","area":6,"pricePerM2":420000,"category":"b","status":"reserved","company":""},{"id":"B5","section":"B","area":6,"pricePerM2":420000,"category":"b","status":"available","company":""},{"id":"B6","section":"B","area":10,"pricePerM2":420000,"category":"b","status":"available","company":""},{"id":"B7","section":"B","area":6,"pricePerM2":420000,"category":"b","status":"available","company":""},{"id":"B8","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B9","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B10","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B11","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B12","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B13","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B14","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B15","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B16","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B17","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B18","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B19","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B20","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B21","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B22","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B23","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"occupied","company":"JIANGSU KINGERTAI NEW MATERIAL TECHNOLOGY CO.,LTD."},{"id":"B24","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B25","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B26","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B27","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B28","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B29","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B30","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B31","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B32","section":"B","area":12,"pricePerM2":360000,"category":"b","status":"occupied","company":"Чухал Барилга ХХК"},{"id":"B33","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"occupied","company":"Harbin Jiaolian Power Cable Manufacturing Co., Ltd."},{"id":"B34","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B35","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B36","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B37","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B38","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B39","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B40","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B41","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B42","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B43","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B44","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"occupied","company":"Institute of Architectural Materials Technology"},{"id":"B45","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B46","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B47","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B48","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B49","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B50","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B51","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B52","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B53","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B54","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B55","section":"B","area":12,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B56","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B57","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B58","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B59","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B60","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B61","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B62","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B63","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B64","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B65","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B66","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B67","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B68","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B69","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B70","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B71","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B72","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B73","section":"B","area":10,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B74","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B75","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B76","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B77","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B78","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B79","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B80","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"B81","section":"B","area":6,"pricePerM2":360000,"category":"b","status":"available","company":""},{"id":"G1","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G2","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G3","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G4","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G5","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G6","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G7","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G8","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G9","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G10","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G11","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G12","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G13","section":"G","area":0,"pricePerM2":40000,"category":"g","status":"available","company":""},{"id":"G14","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G15","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G16","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G17","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G18","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G19","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G20","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G21","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G22","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""},{"id":"G23","section":"G","area":0,"pricePerM2":50000,"category":"g","status":"available","company":""}] as Booth[];

const CATEGORY_LABELS: Record<Booth['category'], string> = {
  standard: 'А павильон (энгийн)',
  supporting: 'А павильон (дунд)',
  sponsor: 'А павильон (онцгой)',
  b: 'B павильон',
  g: 'Гадаа талбай',
};

// BARILGA EXPO вэбсайтын зочдод зориулсан туслах чатбот.
// Энэ нь Vercel serverless function бөгөөд Gemini API-г сервер талд
// дуудаж, түлхүүр (API key)-г клиент рүү ил гаргахгүй.

const SYSTEM_INFO = `
Чи бол "BARILGA EXPO" - Олон улсын барилгын үзэсгэлэн яармагийн вэбсайтын
зочдод туслах AI туслах. Зөвхөн Монгол хэлээр, эелдэг, дэлгэрэнгүй боловч
ойлгомжтой хариулт өгнө (хэрэглэгч өөр хэлээр асуувал тухайн хэлээр хариул).
Боломжтой бол доорх мэдээллээс ХОЛБООТОЙ бүх дэлгэрэнгүйг (тоо баримт, жагсаалт,
холбоо барих утас/имэйл гэх мэт) багтаан хариул - хэт хураангуйлж бүү алгасаарай.

== ЕРӨНХИЙ МЭДЭЭЛЭЛ ==
- Арга хэмжээний нэр: 40 дэх удаагийн "BARILGA EXPO" Олон улсын барилгын үзэсгэлэн яармаг.
- Огноо: 2026 оны 9 дүгээр сарын 11-13-ны өдрүүд.
- Байршил: "Буянт-Ухаа" спортын ордон, Улаанбаатар хот, Монгол улс.
- Энэ нь Монгол Улсад орчин цагийн барилгын салбар үүсэж хөгжсөний 100 жилийн ойн хүрээнд
  зохион байгуулагдаж буй томоохон арга хэмжээ.
- Зохион байгуулагч: Хот байгуулалт, барилга, орон сууцжуулалтын яам (ерөнхий зохион байгуулагч).
- Хамтран зохион байгуулагчид: Нийслэлийн Засаг даргын Тамгын газар, Барилгын хөгжлийн төв.

== ТОО БАРИМТ (өмнөх үзэсгэлэнгүүдийн дүн) ==
- 400+ оролцогч: дотоод, гадаадын тэргүүлэгч брэнд, аж ахуйн нэгжүүд.
- 30,000+ үзэгч: хөрөнгө оруулагчид, мэргэжилтнүүд, хэрэглэгчид.
- 100+ тэрбум төгрөгийн борлуулалт, гэрээ хэлцэл үзэсгэлэнгийн үеэр хийгддэг.
- 18 жилийн турш тогтмол, амжилттай зохион байгуулагдаж ирсэн (40 дэх удаа).

== ҮЗЭСГЭЛЭНГИЙН ЧИГЛЭЛҮҮД ==
1. Шинэ орон сууц, үл хөдлөх хөрөнгө: тансаг болон стандарт орон сууц, хаус дизайн,
   амины орон сууц, үл хөдлөх хөрөнгийн зуучлал, оффис/үйлчилгээний шийдлүүд.
2. Барилгын материал, дэвшилтэт технологи: барилгын материал, засал чимэглэл,
   цахилгаан эрчим хүч & холбоо дохиолол, сантехник & агааржуулалт, интерьер/экстерьер,
   ландшафт & зураг төслийн шийдлүүд.
3. Гадаа талбай: хүнд машин механизм, багаж тоног төхөөрөмж, угсралтын материал,
   зөөврийн сууц, амины орон сууцны жишиг загварууд.

== ТАЛБАЙ ЗАХИАЛГА (Оролцогч компаниудад) ==
- Сайтын "Талбай захиалах" товч/хуудас (booking хуудас)-аар дамжуулан онлайнаар
  захиалгын хүсэлт илгээнэ.
- Бөглөх мэдээлэл: байгууллагын нэр, улсын бүртгэлийн дугаар (РД), гэрчилгээний дугаар,
  хаяг, утас, и-мэйл, холбогдох ажилтан/албан тушаал, хүссэн талбайн хэмжээ/байршил
  (жишээ: 18м² (3x6), А блок), үзэсгэлэнд гаргах бүтээгдэхүүн/үйлчилгээний тайлбар.
- Нэмэлт үйлчилгээнүүд (сонголтоор): стенд хийц угсралт, тайзны хөтөлбөр/семинар,
  VIP өрөө.
- Хүсэлтийг хүлээн авмагц зохион байгуулах багийнхан холбогдож, тохирох талбай,
  гэрээ болон нэхэмжлэхийг бэлтгэн хүргэнэ.
- 1:1 / B2B уулзалт: оролцогч ба худалдан авагч талуудын хооронд бизнесийн хамтын
  ажиллагааг дэмжих зорилгоор урьдчилсан мэдээлэл, бүртгэлийн дагуу B2B уулзалт
  зохион байгуулдаг.

== ХОЛБОО БАРИХ ==
- Хаяг: Улаанбаатар 13373, Баянзүрх дүүрэг, 6-р хороо, "BARILGA.MN" оффис.
- Утас: +976 7711 3333, 9990 7816 (Англи хэлээр ярих бол: 9990 7814).
- И-мэйл: expo@barilga.mn
- Ажиллах цаг: Даваа-Баасан, 8:30-17:30.

== САЙТЫН БҮТЭЦ ==
- Нүүр (товч мэдээлэл, тоо баримт, countdown, талбай захиалах товч)
- Мэдээ (Арга хэмжээтэй холбоотой сүүлийн үеийн мэдээ)
- Зургийн цомог (Өмнөх үзэсгэлэнгийн зургууд)
- Хөтөч / Удирдамж (оролцогч, зочдод зориулсан дэлгэрэнгүй заавар)
- Хөтөлбөр (өдөр тус бүрийн арга хэмжээний цагийн хуваарь)
- Холбоо барих

Хэрэв чамд тодорхой хариулах мэдээлэл байхгүй бол яаралтай тусламж эсвэл
дэлгэрэнгүй мэдээллийн хувьд expo@barilga.mn эсвэл +976 7711 3333 / 9990 7816
дугаараар холбогдохыг санал болго. Хариултаа Markdown заголовок биш, энгийн текст
эсвэл шаардлагатай бол жагсаалт ("- " эсвэл "1.") хэлбэрээр бич.

== ЛИНК/ТОВЧ ӨГӨХ ДҮРЭМ ==
- Хэрэглэгч талбай захиалах хүсэлтэй бол, эсвэл захиалгын маягт руу чиглүүлэх шаардлагатай бол
  яг ийм markdown линк өг: [Талбай захиалах хуудас руу очих](/booking)
- Хэрэглэгч утсаар холбогдох/залгах хүсэлтэй бол, эсвэл "хэн нэгэнтэй ярих", "мэргэжилтэнтэй
  холбогдох" гэх мэт хүсвэл яг ийм markdown линк өг: [99907814 рүү залгах](tel:99907814)
- Эдгээр линкүүдийг зохистой үед санал болгож, текстээ хэт давтахгүй, тохиромжтой газар нэг
  л удаа оруул.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages } = req.body as {
      messages: { role: 'user' | 'model'; text: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages талбар шаардлагатай' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'AI чат тохиргоо хийгдээгүй байна (GEMINI_API_KEY дутуу).' });
      return;
    }

    // Хөтөлбөр, мэдээ болон сул талбайн мэдээллийг Supabase-аас татаж нэмэлт контекст болгож өгнө
    let programInfo = '';
    let boothInfo = '';
    let newsInfo = '';
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.from('site_data').select('data').eq('id', 'config').single();
        const program = (data?.data as any)?.program;
        if (Array.isArray(program) && program.length > 0) {
          programInfo = `\nХөтөлбөрийн мэдээлэл (JSON): ${JSON.stringify(program).slice(0, 4000)}`;
        }

        // Мэдээний хэсэг — өмнөх үзэсгэлэн, шилдэг байгууллага, үр дүн г.м асуултад хариулахад ашиглана
        const news = (data?.data as any)?.news;
        if (Array.isArray(news) && news.length > 0) {
          const stripHtml = (s: string) =>
            String(s || '')
              .replace(/<[^>]*>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&hellip;/g, '…')
              .replace(/&#8220;|&#8221;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/\s+/g, ' ')
              .trim();
          const items = news.slice(0, 6).map((n: any) => {
            const body = stripHtml(n.content || n.description || '').slice(0, 900);
            return `• [${n.date || ''}] ${n.title || ''}${body ? ' — ' + body : ''}`;
          }).join('\n');
          newsInfo = `\n\n== САЙТЫН МЭДЭЭ / НИЙТЛЭЛҮҮД ==\nДоорх нь сайтын "Мэдээ" хэсгийн агуулга. Өмнөх үзэсгэлэнгийн үр дүн, шилдэг/онцлох оролцогч байгууллагууд, шагнал, ивээн тэтгэгчид, статистик, зохион байгуулалт зэрэг асуултад ЗӨВХӨН доорх мэдээнд тулгуурлан тодорхой, нэр дурдан хариул. Хэрэв тухайн асуултын хариу мэдээнд байхгүй бол таамаглахгүйгээр "Энэ талаар сайтын мэдээнд тодорхой мэдээлэл алга" гэж хэлээд холбоо барих мэдээллийг өг.\n${items}`.slice(0, 7000);
        }

        const { data: statusRows } = await supabase.from('booth_status').select('id, status, is_reserved');
        const ov: Record<string, string> = {};
        (statusRows || []).forEach((r: any) => {
          const st = r.status ?? (r.is_reserved ? 'occupied' : null);
          if (st) ov[r.id] = st;
        });
        const eff = (b: typeof booths[number]) => ov[b.id] ?? b.status;
        const available = booths.filter(b => eff(b) === 'available');
        const summary = available
          .slice(0, 70)
          .map(b => `${b.id} (${b.area}м², ${CATEGORY_LABELS[b.category]})`)
          .join('; ');
        boothInfo = `\n\nСул (захиалах боломжтой) талбайн жагсаалт (${available.length}/${booths.length}): ${summary || 'Одоогоор сул талбай алга'}.\nТэмдэглэл: "Нөөц" төлөвтэй талбайг зөвхөн зохион байгуулагч (админ) нөөцөөс гаргасны дараа л захиалах боломжтой тул хэрэглэгчид санал болгохгүй. Захиалагдсан талбайг бас санал болгохгүй.\nЧУХАЛ: Талбайн ҮНИЙН мэдээллийг хэрэглэгчид ХЭЗЭЭ Ч бүү дурд, бүү тооцоол, бүү тааварла. Үнийн талаар асуувал "Үнийн дэлгэрэнгүй мэдээллийг авахын тулд бидэнтэй холбогдох эсвэл 'Талбай захиалах' хуудас дээрх захиалгын хүсэлтийг бөглөнө үү" гэж хариул.\nЧУХАЛ ЗАН АРГА: Хэрэглэгч талбай захиалах/түрээслэх талаар асуувал шууд жагсаалт өгөхгүй. Эхлээд ямар хэмжээтэй (хэдэн м²) талбай хэрэгтэйг, шаардлагатай бол ямар төрлийн талбай (стандарт, дэмжих, спонсор гэх мэт) хүсэж байгааг асуу. Хэрэглэгч хэмжээгээ хэлсний дараа дээрх СУЛ жагсаалтаас тухайн хэмжээнд ХАМГИЙН ОЙР тохирох (тэнцүү эсвэл ойролцоо) талбайнуудыг дугаар, хэмжээ, ангиллаар нь санал болго (үнийг ДУРДАХГҮЙГЭЭР), дараа нь [Талбай захиалах хуудас руу очих](/booking) линкээр дамжуулан захиалгын хүсэлт илгээхийг зөвлө.`;
      }
    } catch {
      // Мэдээлэл авч чадаагүй ч чат ажиллаж байх ёстой
    }

    const ai = new GoogleGenAI({ apiKey });

    // Сүүлийн ~10 мессежийг л авч, контентыг хэт томруулахгүй
    const contents = messages.slice(-10).map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || '').slice(0, 2000) }],
    }));

    // Gemini хариу хэт удвал hang болохгүйн тулд 25 секундын хязгаар
    const genPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INFO + programInfo + newsInfo + boothInfo,
        maxOutputTokens: 900,
        temperature: 0.4,
      },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 25000),
    );
    const result: any = await Promise.race([genPromise, timeoutPromise]);
    const text = result?.text || 'Уучлаарай, одоогоор хариулт өгөх боломжгүй байна.';

    res.status(200).json({ reply: text });
  } catch (err: any) {
    console.error('chat api error', err);
    res.status(500).json({ error: 'Серверийн алдаа гарлаа. Дахин оролдоно уу.' });
  }
}
