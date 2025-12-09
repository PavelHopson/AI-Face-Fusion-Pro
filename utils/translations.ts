
import { Language, AssetType, AspectRatio } from '../types';

interface Translation {
  title: string;
  subtitle: string;
  assetLabels: Record<AssetType, string>;
  aspectRatios: Record<AspectRatio, string>;
  systemStatus: string;
  statusIdle: string;
  statusReadyToAnalyze: string;
  statusReadyToRender: string;
  statusAnalyzing: string;
  statusAnalyzed: string;
  statusRendering: string;
  statusSuccess: string;
  errorAnalyze: string;
  errorRender: string;
  analyzeBtn: string;
  renderBtn: string;
  promptLabel: string;
  resultTitle: string;
  resultPlaceholder: string;
  download: string;
  ratioLabel: string;
  uploader: {
    clickToChange: string;
    clickOrDrag: string;
  }
}

export const translations: Record<Language, Translation> = {
  en: {
    title: "Valhalla Organizer: Face Fusion",
    subtitle: "Compose your perfect avatar. Mix style, clothing, and identity.",
    assetLabels: {
      face: "YOUR FACE (Base Identity)",
      clothing: "Clothing (The Outfit)",
      shoes: "Shoes (Footwear)",
      accessories: "Accessories",
      hairstyle: "Hairstyle",
      style: "Style / Background / Lighting"
    },
    aspectRatios: {
      '1:1': 'Square (Instagram)',
      '9:16': 'Vertical (TikTok/Reels)',
      '16:9': 'Landscape (YouTube)',
      '3:4': 'Portrait (3:4)',
      '4:3': 'Classic (4:3)'
    },
    systemStatus: "SYSTEM STATUS",
    statusIdle: "Upload your face and at least one asset to begin.",
    statusReadyToAnalyze: "Assets loaded. Click 'Analyze Inputs' to prepare the prompt.",
    statusReadyToRender: "Prompt ready. Click 'Generate Composition' to render.",
    statusAnalyzing: "Gemini is analyzing all your inputs to build a master prompt...",
    statusAnalyzed: "Analysis complete. You can tweak the prompt below.",
    statusRendering: "Gemini is fusing your identity into the composed scene...",
    statusSuccess: "Composition generated successfully!",
    errorAnalyze: "Failed to analyze assets.",
    errorRender: "Generation Failed",
    analyzeBtn: "Analyze Inputs & Plan",
    renderBtn: "Generate Composition",
    promptLabel: "Master Scene Description (Generated from inputs):",
    resultTitle: "Final Composition",
    resultPlaceholder: "Your generated image will appear here.",
    download: "Download Result",
    ratioLabel: "Output Aspect Ratio",
    uploader: {
      clickToChange: "Change",
      clickOrDrag: "Upload"
    }
  },
  ru: {
    title: "Valhalla Organizer: Face Fusion",
    subtitle: "Создайте идеальный аватар. Смешивайте стиль, одежду и личность.",
    assetLabels: {
      face: "ВАШЕ ЛИЦО (Основа)",
      clothing: "Одежда (Что надеть)",
      shoes: "Обувь",
      accessories: "Аксессуары",
      hairstyle: "Прическа",
      style: "Стилистика / Фон / Свет"
    },
    aspectRatios: {
      '1:1': 'Квадрат (Instagram)',
      '9:16': 'Вертикальный (TikTok/Reels)',
      '16:9': 'Пейзаж (YouTube)',
      '3:4': 'Портрет (3:4)',
      '4:3': 'Классика (4:3)'
    },
    systemStatus: "СТАТУС СИСТЕМЫ",
    statusIdle: "Загрузите фото лица и хотя бы один элемент стиля.",
    statusReadyToAnalyze: "Ресурсы загружены. Нажмите «Анализ», чтобы составить план.",
    statusReadyToRender: "План готов. Нажмите «Генерация», чтобы создать изображение.",
    statusAnalyzing: "Gemini анализирует все входные данные для составления промпта...",
    statusAnalyzed: "Анализ завершен. Вы можете поправить описание ниже.",
    statusRendering: "Gemini внедряет вашу личность в созданную сцену...",
    statusSuccess: "Композиция успешно создана!",
    errorAnalyze: "Ошибка анализа ресурсов.",
    errorRender: "Ошибка генерации.",
    analyzeBtn: "Анализ Входных Данных",
    renderBtn: "Генерация",
    promptLabel: "Описание Сцены (На основе ваших фото):",
    resultTitle: "Результат",
    resultPlaceholder: "Здесь появится ваше изображение.",
    download: "Скачать результат",
    ratioLabel: "Формат изображения",
    uploader: {
      clickToChange: "Заменить",
      clickOrDrag: "Загрузить"
    }
  }
};
