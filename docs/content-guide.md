# Content guide (for the business owner)

You do not need to be a programmer. Everything below is done on the GitHub website, in your browser. If a step says **ask a developer**, do not try it yourself.

**Repository address:** https://github.com/bryanscot/ashland-concrete-systems-limited (TODO(owner): move this to a company-owned GitHub account).

## How to edit a file and publish (used by every task below)

1. Open the repository address above and sign in.
2. Click the folder names to find the file (the exact path is given in each task, for example `js/products.js`).
3. Click the **pencil icon** (Edit this file) at the top right of the file.
4. Make your change, keeping all commas, quotes and brackets exactly as they are.
5. Click **Commit changes…**, write a short note (for example "Update phone number"), and click **Commit changes** again.
6. Wait **2 to 5 minutes**. If you changed products, company details, vacancies or images, a GitHub robot first rebuilds the product pages and the PDF catalogue (see the **Actions** tab: a green tick means success). The website host then publishes the new version. (Edits to `index.html` alone skip the robot and publish straight away.)
7. Open the website and press **Ctrl + Shift + R** (hard refresh) to check your change. On a phone, close and reopen the browser tab.

If something looks broken, go to the repository, click **Commits**, open your commit and click **Revert**, or ask a developer.

## Add a product

1. **Prepare two photos** (see "Replace or add images" below): a clean product photo and a photo of the product in use.
2. In GitHub open `assets/images/`, click **Add file > Upload files**, drag the two photos in and click **Commit changes**.
3. Open `js/products.js` and click the pencil.
4. Find the last product block (it ends with `},`). Copy the block below, paste it **after** that `},`, and change the values:

```js
  {
    id: "cabro-100",
    name: "Ashland Cabro 100",
    category: "paving",
    dims: { l: 200, w: 100, h: 100 },
    image: "assets/images/ashland-cabro-100-block.webp",
    inUseImage: "assets/images/ashland-cabro-100-driveway.webp",
    alt: "Ashland Cabro 100, a rectangular grey concrete paving block",
    description: "Rectangular concrete paving block, 100 mm thick.",
    shownIn: "Shown laid as a driveway."
  },
```

Rules:
- `id`: lowercase letters, numbers and dashes only, **different from every other product**. It becomes the web address (`/products/cabro-100/`). Never change it later.
- `category`: must be exactly `paving`, `blocks` or `kerbs`. A new category works but gets generic wording: ask a developer.
- `dims`: numbers only, in millimetres: `l` length, `w` width, `h` height. Decimals are allowed (`112.5`).
- `image` and `inUseImage`: the path must match the uploaded file name exactly, including capitals and the ending (`.webp`).
- `shownIn`: a short sentence that customers see in the product pop-up on the home page. Write it for customers.
- Keep a comma after every `}` except where the list ends.

5. Commit (steps 5 to 7 above). The product appears on the home page, in the Products menu, on its own page, in the calculator and in the PDF.

## Edit a product (name, size, description, photo)

Open `js/products.js`, find the product by name, change the value between the quotes (or the numbers), and commit. To swap a photo, either upload a new file with the **same name** (see images below) or change the `image` / `inUseImage` path.

## Remove a product

1. Open `js/products.js`, find the product's whole block (from `{` to `},`) and delete it. To hide it temporarily instead, put `/*` on the line before the block and `*/` on the line after. (The unused "Ashland Pavers 90" block in the file is hidden this way.)
2. Check `index.html`: the home page slideshow uses `data-product="..."` ids. If you removed a product whose id appears there (search the page for the id), ask a developer to update the slideshow.
3. Commit. The product page is deleted automatically, so its old address will show "page not found". Optionally delete its photos from `assets/images/`.

## Change the phone number, WhatsApp number or address

These live in **one settings file plus a few places typed directly into pages**, so use the search-and-replace in VS Code (ask a developer if you do not have it).

1. Open `js/config.js` and change:
   - `phoneDisplay` (how it is written, e.g. `0769 872 363`)
   - `phoneTel` (international, with plus, e.g. `+254769872363`)
   - `whatsappNumber` (international, **digits only, no plus, no spaces**, e.g. `254769872363`)
   - `locationLine` and `postalLine` (address text), `mapQuery` (text used for the map search)
2. Then search the project (VS Code: Ctrl + Shift + H, **Replace in Files**) for the old number written each way (`0769 872 363`, `+254769872363`, `254769872363`) and the old address text, and replace them in **`index.html`**, **`404.html`** and **`catalogue.html`** only.
3. Commit. The product pages, FAQ, careers page, privacy page and PDF pick up `js/config.js` automatically after the robot runs. WhatsApp links on the home page are also rewritten from `js/config.js` by the robot.
4. Test: tap each phone and WhatsApp button on the live site.

The address wording is currently written differently on different pages (Thika or Murang'a). TODO(owner): decide the official wording first.

## Replace or add images

| Image | Where it is used | Size to export | Notes |
|---|---|---|---|
| Product photo (`image`) | Product cards, product page, PDF | **1200 x 900 px (4:3)**, minimum 800 x 600 | Plain light background, product centred with space around it |
| In-use photo (`inUseImage`) | Product page, pop-up, category banner in the PDF | **1600 x 900 px (16:9)**, minimum 1200 x 675 | The subject should be in the middle: edges are cropped |
| Home slideshow photos | Top of the home page (`index.html`) | **1600 x 1000 px (16:10)** | The first photo loads first: keep it small |
| Social sharing banner | `assets/images/ashland-banner.*` | **1200 x 630 px**, JPG or PNG | WhatsApp and some social apps may not show WebP previews. TODO(owner): developer to confirm and replace |

- **Format:** `.webp` (what the site uses now) or `.jpg`. Do not use PNG for photos.
- **Maximum file size:** keep each photo **under 300 KB**. Nothing in the code enforces this limit, so you must. Some current files are larger.
- **Why it matters:** every photo is also embedded in the PDF catalogue. Oversized photos make the PDF very large (currently about 43 MB) and slow the site.
- **How to compress (free, in the browser):** go to https://squoosh.app, drop the photo in, choose **WebP** on the right, set quality to about 80, set **Resize** to the width in the table, check the file size shown at the bottom, then download.
- **To replace a photo:** give the new file the **exact same name** as the old one, then in GitHub open `assets/images/`, click **Add file > Upload files**, upload it (it replaces the old one) and commit. If you use a different name, update the path in `js/products.js`.

## Update the catalogue PDF

You normally do nothing: the PDF (`assets/Ashland-Product-Catalogue.pdf`) is rebuilt automatically whenever you change products, company details, vacancies or images, and the website's download buttons always use the newest one. To force a rebuild: GitHub > **Actions** > **Build catalogue PDF and pages** > **Run workflow**. Do not upload a PDF by hand: it is overwritten. Changing the wording inside the PDF is a developer task (`catalogue.html`).

## Edit the FAQ text

The FAQ exists in **two places** and they should say the same thing:
- Home page: `index.html`, in the section with `id="faq"`. Each question is `<details><summary>Question</summary><p>Answer</p></details>`.
- The FAQ page (`/faq/`): `tools/build_pages.mjs`, in the list that starts `const FAQ = [`. Each entry has the question on one line and the answer on the next, both in double quotes and ending with a comma. Keep the double quotes; if the text needs a double quote, write `\"`.

Edit the text between the quotes (or between the tags), keep the punctuation around it, and commit.

## Vacancies

- `js/jobs.js`: each vacancy has `published: true` (shown on `/careers/`) or `published: false` (hidden). Change only that word.
- `js/config.js`, `careers` block: `applicationDeadline` and `interviewInfo` text, shown on the page only when filled in.

## What NOT to touch

- **Generated files and folders**, which are overwritten by the robot: `products/`, `cabro-pavers/`, `hollow-blocks/`, `kerb-stones/`, `faq/`, `quantity-calculator/`, `careers/`, `privacy.html`, `sitemap.xml`, `robots.txt`, `assets/Ashland-Product-Catalogue.pdf`.
- **Comment markers** in `index.html` that look like `<!--ABOUT-PROOF:START-->` ... `<!--ABOUT-PROOF:END-->`. Do not delete or edit them or what is between them.
- **Product `id` values** after a product is live (they are web addresses).
- `.github/`, `tools/`, `lib/`, `api/`, `functions/` and the other files in `js/`.
- `leadCapture` in `js/config.js`: switch it on only when a developer has set up the server settings (see [runbook](runbook.md)).
- Never paste passwords, tokens or API keys into any file in this repository.