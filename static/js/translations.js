// static/js/translations.js

const translations = {
    en: {
      // Language Switch Buttons
      "lang_zh": "中文", // For potential tooltips or labels if needed
      "lang_en": "En",
  
      // Intro Section
      "main_title": "Growing Notes of HeluoShuyuan: Mapping 15-Minute Reading Circles Around Over 200 Reading Rooms",
      "stat_label_bookstores": "Heluo Bookstores Across City & Countryside",
      "stat_label_reading_circle": "15-Min Walking Reading Circle Taking Shape",
      "stat_label_annual_visits": "Annual Visits",
      "stat_label_loans": "Total Loans",
      "unit_bookstore": " Units", // Note the space before 'Units'
      "unit_minute": " Min",
      "unit_million_plus": "M+", // Abbreviation for Million+
      "intro_text": "Imagine stepping into a comfortable, bright, book-filled free reading space right at your doorstep, next to a park, or even inside a mall - this is the 'Urban Study Room', a new type of public cultural facility popular across China in recent years. They extend traditional libraries, acting as accessible cultural posts.",
      "intro_text_part2": "In the ancient capital Luoyang, these study rooms share a unified, poetic name: 'Heluo Book苑 (Heluo Book Garden/Academy)'. More than just reading spots, they represent a 'Growth Diary' of how urban culture quietly develops. From a few initial locations to a network of over 200 rooms today, they have rapidly risen, 'drawing' a convenient '15-minute reading circle' and profoundly changing the city's cultural warmth and residents' lives.",
      "intro_question1_v3": "How did this 'growth miracle' of reading spaces happen?",
      "intro_question2_v3": "Where did the construction funds come from? How are service quality and sustainable operation ensured?",
      "intro_question3_v3": "What do citizens think of these nearby study rooms? What challenges have they faced?",
      "intro_guide_v3_part1": "Let's open this 'Heluo Bookstore Growth Diary' together, explore the wisdom of spatial layout, the journey of its growth path, listen to the echoes of citizens' voices, and finally decode the 'Luoyang Model' that fills the city with the fragrance of books.",
      "intro_guide_v3_part2": "Click the navigation above to start your exploration journey.",
  
      // Navigation (Add keys for your nav links)
      "nav_overview": "Overview",
      "nav_achievement": "Today's Achievements",
      "nav_journey": "Growth Journey",
      "nav_model": "Secret Sauce",
      "nav_spatial": "Spatial Decoding",
      "nav_feedback": "Citizen Voices",
      "nav_showcase": "Showcase",
      "nav_conclusion": "National Context",
      // Add other keys from your HTML with data-i18n attributes here...
  
    },
    zh: {
      // Language Switch Buttons
      "lang_zh": "中文",
      "lang_en": "En",
  
      // Intro Section
      "main_title": "河洛书苑生长笔记：百座书房画出十五分钟阅读圈",
      "stat_label_bookstores": "河洛书苑遍布城乡",
      "stat_label_reading_circle": "步行阅读圈初步形成",
      "stat_label_annual_visits": "年服务人次",
      "stat_label_loans": "累计借阅量",
      "unit_bookstore": "座",
      "unit_minute": "分钟",
      "unit_million_plus": "万+",
      "intro_text": "想象一下，在家门口、公园旁、甚至商场里，就能走进一个舒适明亮、书香四溢的免费阅读空间——这就是近年来风靡全国的新型公共文化设施：“城市书房”。它们是传统图书馆的延伸，更是触手可及的文化驿站。",
      "intro_text_part2": "在千年古都洛阳，这些城市书房拥有一个统一且诗意的名字：“河洛书苑”。这不仅仅是一个个阅读点，更是一部关于城市文化如何悄然生长的“生长笔记”。从最初的零星几家到如今超二百座书房的网络，它们迅速崛起，“画”出了一张便捷的“十五分钟阅读圈”，深刻地改变着这座城市的文化温度与居民生活。",
      "intro_question1_v3": "这场阅读空间的“生长奇迹”是如何发生的？",
      "intro_question2_v3": "建设资金从何而来？如何保障服务质量与可持续运营？",
      "intro_question3_v3": "市民们对这些身边的书房评价如何？又遇到了哪些挑战？",
      "intro_guide_v3_part1": "让我们一起翻开这本“河洛书苑生长笔记”，探索空间布局的智慧、成长足迹的历程、市民心声的回响，解码“洛阳模式”。", // Simplified slightly
      "intro_guide_v3_part2": "点击上方导航，开启探索之旅。",
  
      // Navigation
      "nav_overview": "概览",
      "nav_achievement": "今日成就",
      "nav_journey": "成长之路",
      "nav_model": "建设密码",
      "nav_spatial": "空间解码",
      "nav_feedback": "市民心声",
      "nav_showcase": "一房一景",
      "nav_conclusion": "全国坐标",
      // Add other keys from your HTML with data-i18n attributes here...
    }
  };
  
  // Function to apply translations
  function translatePage(lang) {
    if (!translations[lang]) {
      console.warn(`Translation language "${lang}" not found.`);
      return;
    }
  
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[lang][key]) {
        // Handle potential nested elements like <strong> or <span> within the paragraph
        // Preserve non-text nodes and translate text nodes
         if (element.childNodes.length > 1 || element.querySelector('*')) {
              // More complex content, translate text nodes carefully
               translateComplexElement(element, key, lang);
           } else {
              // Simple text content
               element.textContent = translations[lang][key];
           }
  
      } else {
        console.warn(`Translation key "${key}" not found for language "${lang}".`);
      }
    });
  
      // Special handling for dynamic units in key stats (if needed)
      document.querySelectorAll('.key-stats .stat-item').forEach(item => {
          const labelDiv = item.querySelector('.stat-label');
          const numberDiv = item.querySelector('div[style*="font-size: 2.5em"]'); // Selector for the number div
          if (labelDiv && numberDiv) {
              const labelKey = labelDiv.getAttribute('data-i18n');
              if(labelKey && translations[lang][labelKey]) {
                   labelDiv.textContent = translations[lang][labelKey];
              }
  
              // Find the span for the unit inside the number div
              const unitSpan = numberDiv.querySelector('span');
              if(unitSpan) {
                   const unitKeyBase = labelKey?.replace('stat_label_', 'unit_'); // Try to derive unit key
                   const unitKey = unitKeyBase || getUnitKeyFromContent(numberDiv.textContent); // Fallback if no label key
                   if(unitKey && translations[lang][unitKey]) {
                      unitSpan.textContent = translations[lang][unitKey];
                   }
              }
          }
      });
  }
  
  // Helper function to get a unit key based on content (fallback)
  function getUnitKeyFromContent(text) {
      if (text.includes('座')) return 'unit_bookstore';
      if (text.includes('分钟')) return 'unit_minute';
      if (text.includes('万+')) return 'unit_million_plus'; // Match based on common pattern
      return null;
  }
  
  
  // Helper function to translate elements with mixed content (text and child elements)
  function translateComplexElement(element, key, lang) {
      const translation = translations[lang][key];
      if (!translation) return;
  
      // Simple approach: If translation likely contains HTML (e.g., has <strong>), set innerHTML
      if (translation.includes('<strong') || translation.includes('<span') || translation.includes('<i')) {
           // Be cautious with innerHTML if translations are user-generated
           element.innerHTML = translation;
      } else {
           // Try to replace only text nodes if possible, preserving child elements
           // This is more complex and might require traversing childNodes recursively
           // For now, a simpler approach: set textContent if no obvious HTML in translation
           element.textContent = translation;
           // If the above doesn't work well for some elements, you might need
           // a more sophisticated recursive text node replacement function.
      }
  }
  
  
  // Initial translation on load (assuming language switch logic sets initial lang)
  // This might be called by initializeLanguageSwitch or directly here if needed
  // document.addEventListener('DOMContentLoaded', () => {
  //     const initialLang = document.documentElement.lang || 'zh';
  //     translatePage(initialLang);
  // });