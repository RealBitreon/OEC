# 🎩✨ دليل الكود السري - Cheat Code Guide

## كيفية الاستخدام / How to Use

عندما يكون المستخدم في صفحة الإجابة على الأسئلة، يمكنه فتح Console المتصفح وكتابة:

When a user is on a question answering page, they can open the browser Console and type:

```javascript
abrkadabra()
```

## ماذا يحدث؟ / What Happens?

سيتم عرض جميع الإجابات الصحيحة مع الأدلة في Console بشكل منسق وجميل مع:
- رقم السؤال
- نص السؤال
- الإجابة الصحيحة
- الدليل من المصدر (المجلد، الصفحة، السطر)

All correct answers with evidence will be displayed in the Console in a beautiful formatted way with:
- Question number
- Question text
- Correct answer
- Source evidence (Volume, Page, Line)

## أين يعمل؟ / Where Does It Work?

الكود السري يعمل في:

The cheat code works in:

1. **صفحة المشاركة في المسابقة (للزوار)**
   - `/competition/[slug]/participate`
   - Competition participation page (for visitors)

2. **صفحة المشاركة في المسابقة (للمستخدمين المسجلين)**
   - `/dashboard/competition/[slug]/participate`
   - Competition participation page (for logged-in users)

3. **صفحة الأسئلة التدريبية**
   - `/questions/[id]`
   - Training questions page

## كيفية فتح Console / How to Open Console

### في Chrome / Edge / Brave:
- اضغط `F12` أو `Ctrl + Shift + J` (Windows/Linux)
- اضغط `Cmd + Option + J` (Mac)

### في Firefox:
- اضغط `F12` أو `Ctrl + Shift + K` (Windows/Linux)
- اضغط `Cmd + Option + K` (Mac)

### في Safari:
- فعّل Developer Menu من Preferences > Advanced
- اضغط `Cmd + Option + C`

## مثال على الاستخدام / Usage Example

```javascript
// في صفحة الأسئلة، افتح Console واكتب:
// On the questions page, open Console and type:

abrkadabra()

// سيظهر:
// Will show:

🎩✨ ABRACADABRA! ✨🎩
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
الإجابات الصحيحة:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 السؤال 1:
ما هي عاصمة سلطنة عمان؟
✅ الإجابة الصحيحة: مسقط

📌 السؤال 2:
متى تأسست سلطنة عمان الحديثة؟
✅ الإجابة الصحيحة: 1970

...
```

## ملاحظات تقنية / Technical Notes

- الكود يعمل فقط عندما تكون في صفحة الأسئلة
- يتم تنظيف الكود تلقائياً عند مغادرة الصفحة
- الكود آمن ولا يؤثر على البيانات المرسلة للخادم
- يعمل في جميع المتصفحات الحديثة

- The code only works when you're on a questions page
- The code is automatically cleaned up when leaving the page
- The code is safe and doesn't affect data sent to the server
- Works in all modern browsers

## الأمان / Security

⚠️ **تحذير:** هذا الكود مخصص للاختبار والتطوير فقط. في بيئة الإنتاج، يجب إزالته أو تعطيله.

⚠️ **Warning:** This code is for testing and development only. In production, it should be removed or disabled.

## كيفية التعطيل / How to Disable

لتعطيل الكود السري في الإنتاج، احذف أو علّق على `useEffect` الذي يحتوي على `window.abrkadabra` في:

To disable the cheat code in production, delete or comment out the `useEffect` containing `window.abrkadabra` in:

- `app/competition/[slug]/participate/ParticipationForm.tsx`
- `app/dashboard/competition/[slug]/participate/ParticipationForm.tsx`
- `app/questions/[id]/QuestionForm.tsx`

أو أضف شرط بيئة:

Or add an environment condition:

```typescript
React.useEffect(() => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).abrkadabra = () => {
      // ... cheat code logic
    }
  }
}, [questions])
```

---

**تم التنفيذ بنجاح! ✨**
**Successfully Implemented! ✨**
