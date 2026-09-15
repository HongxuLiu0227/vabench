# Project Requirements

You are an expert React and D3.js developer. Your task is to implement a dashboard that exactly replicates the provided Tableau workbook.

## Tech Stack
- React 18+
- TypeScript
- Vite
- D3.js (v7): Use `d3-scale`, `d3-shape`, `d3-axis`, `d3-array`, `d3-selection`, `d3-transition`, `d3-format`, `d3-dsv`.
- CSS: Use standard CSS or CSS Modules. No external UI component libraries (like Ant Design) unless necessary for basic layout.

## Data Loading
1.  The primary data source is located at `/data/Tableau_CSV.csv`.
2.  Use `fetch` to load the data.
3.  Use `d3.csvParse` (or `d3.dsvFormat(",").parse`) to parse the CSV string.
4.  The data interface should be:
    ```typescript
    interface DataRow {
      F1: number;
      Post: string;
      TRUE: number;
      Predicted: number;
      "True Label": string;
      "Predicted Label": string;
      Predicted_XY: number;
      True_XY: number;
    }
    ```

## Sample Data
```json
[
  {
    "": 37966,
    "Post": "making use of angularjs services  i have this code within my <code>usercontroller</code>:   <pre><code>$scope.register = function() {   //this.loading = true;      $http.post( /signup   $scope.user).success(function(data) {         alert( user added );     });  }; </code></pre>   but i m sure i read somewhere that this kind of thing should go within a service. as i m totally new to angularjs could someone should me how to add this to a service and call it from my controller",
    "TRUE": 2,
    "Predicted": 2,
    "True Label": "angularjs",
    "Predicted Label": "angularjs",
    "Predicted_XY": 2.832697614,
    "True_XY": 17.25716773
  },
  {
    "": 35007,
    "Post": "animation on side menu bar using program  <a href= https://github.com/romaonthego/residemenu  rel= nofollow >https://github.com/romaonthego/residemenu</a> this is link of residemenu.    i am new to ios and i am working on new project in which i have made this kind of side menu bar. but one things which i want is that the window which is going back must get tilt on one side.     actually i want one side to get decrease in size like flipkart app in ios. so can you please tell me if there is some way to fix this by doing any coding.",
    "TRUE": 15,
    "Predicted": 9,
    "True Label": "objective-c",
    "Predicted Label": "ios",
    "Predicted_XY": 9.811668672,
    "True_XY": 4.563644952
  },
  {
    "": 35155,
    "Post": "how to make a hover clickable   i m using a jquery to use the fade in effect on an image but the only thing that s clickable is the link inside the image not the image itself  and surrounding the  img  tag with an  a  tag did not work  here s my my problem: <a href= http://www.marcuspedersen.com/dev/index.html  rel= nofollow >http://www.marcuspedersen.com/dev/index.html</a>",
    "TRUE": 8,
    "Predicted": 8,
    "True Label": "html",
    "Predicted Label": "html",
    "Predicted_XY": 8.173579643,
    "True_XY": 11.21898031
  },
  {
    "": 32420,
    "Post": "angularjs: how can i use ng-model dynamic in ng-repeat   i am trying to use dynamic ng-model for multilingual data entry. here is my tabset:   <pre><code>&lt;tabset&gt;     &lt;tab ng-repeat= language in languages  heading= {{language}} &gt;         &lt;input type= text  data-ng-model= name[language]  id= name[language]  class= form-control  &gt;     &lt;/tab&gt; &lt;/tabset&gt; </code></pre>   but it gives error. how can i use it     here is the plunker:    <a href= http://plnkr.co/edit/sxi0yldrahgmgxf6ndc1 p=preview  rel= nofollow >plunker code</a>",
    "TRUE": 2,
    "Predicted": 2,
    "True Label": "angularjs",
    "Predicted Label": "angularjs",
    "Predicted_XY": 2.850963064,
    "True_XY": 17.24386028
  },
  {
    "": 32074,
    "Post": "connecting navigationview and tab  i am just new to android studio and studying how can i send the data that i want by checking a checkbox from one of the tabs.    screenshots here    <img src= https://i.stack.imgur.com/t1f05.png  alt= enter image description here >    <img src= https://i.stack.imgur.com/a1voo.png  alt= enter image description here >    so now i m working with it but i can t send data to the drawers from my tabs because it is an activity. for example i checked the  back massage..  from massage tab and the offer must be visible in the popup when i clicked the  reserved offers  in the navigationview. please help me.    this is my <code>mainactivity.xml</code>   <pre><code> public class mainactivity extends appcompatactivity {     private drawerlayout mdrawerlayout;     private actionbardrawertoggle mtoggle;     private toolbar mtoolbar;       /**      * the {@link android.support.v4.view.pageradapter} that will provide      * fragments for each of the sections. we use a      * {@link fragmentpageradapter} derivative  which will keep every      * loaded fragment in memory. if this becomes too memory intensive  it      * may be best to switch to a      * {@link android.support.v4.app.fragmentstatepageradapter}.      */     private sectionspageradapter msectionspageradapter;      /**      * the {@link viewpager} that will host the section contents.      */     private viewpager mviewpager;      @override     protected void oncreate(bundle savedinstancestate){         super.oncreate(savedinstancestate);         setcontentview(r.layout.activity_main);         mtoolbar=(toolbar)findviewbyid(r.id.nav_act);         setsupportactionbar(mtoolbar);         navigationview navigationview;          mdrawerlayout=(drawerlayout)findviewbyid(r.id.main_content);         mtoggle= new actionbardrawertoggle(this  mdrawerlayout r.string.open r.string.close);         mdrawerlayout.adddrawerlistener(mtoggle);         mtoggle.syncstate();          getsupportactionbar().setdisplayhomeasupenabled(true);          // create the adapter that will return a fragment for each of the three         // primary sections of the activity.         msectionspageradapter = new sectionspageradapter(getsupportfragmentmanager());          // set up the viewpager with the sections adapter.         mviewpager = (viewpager) findviewbyid(r.id.container);         mviewpager.setadapter(msectionspageradapter);          tablayout tablayout = (tablayout) findviewbyid(r.id.tabs);         tablayout.setupwithviewpager(mviewpager);          //drawers functions         navigationview=(navigationview)findviewbyid(r.id.navigation_view);         navigationview.setnavigationitemselectedlistener(new navigationview.onnavigationitemselectedlistener() {             @override             public boolean onnavigationitemselected(@nonnull menuitem item) {                 switch (item.getitemid()){                     case r.id.nav_ac:                         startactivity(new intent(mainactivity.this pop.class));                         mdrawerlayout.closedrawers();                         break;                     case r.id.nav_off:                         startactivity(new intent(mainactivity.this no.class));                         mdrawerlayout.closedrawers();                         break;                     case r.id.nav_am:                         startactivity(new intent(mainactivity.this am.class));                         mdrawerlayout.closedrawers();                         break;                     case r.id.nav_ab:                         startactivity(new intent(mainactivity.this ab.class));                         mdrawerlayout.closedrawers();                         break;                 }                   return true;             }         });       }      @override     public boolean onoptionsitemselected(menuitem item) {         // handle action bar item clicks here. the action bar will         // automatically handle clicks on the home/up button  so long         // as you specify a parent activity in androidmanifest.xml.          if(mtoggle.onoptionsitemselected(item)){             return true;}          return super.onoptionsitemselected(item);     }      /**      * a placeholder fragment containing a simple view.      */     public static class placeholderfragment extends fragment {         /**          * the fragment argument representing the section number for this          * fragment.          */         private static final string arg_section_number =  section_number ;          public placeholderfragment() {         }          /**          * returns a new instance of this fragment for the given section          * number.          */         public static placeholderfragment newinstance(int sectionnumber) {             placeholderfragment fragment = new placeholderfragment();             bundle args = new bundle();             args.putint(arg_section_number  sectionnumber);             fragment.setarguments(args);             return fragment;         }       }      /**      * a {@link fragmentpageradapter} that returns a fragment corresponding to      * one of the sections/tabs/pages.      */     public class sectionspageradapter extends fragmentpageradapter {          public sectionspageradapter(fragmentmanager fm) {             super(fm);         }          @override         public fragment getitem(int position){             switch(position)             {                 case 0:                     tab1 tab1 = new tab1();                     return tab1;                 case 1:                     tab2 tab2 = new tab2();                     return tab2;                 case 2:                     tab3 tab3 = new tab3();                     return tab3;                 case 3:                     tab4 tab4= new tab4();                     return tab4;              }             return null;         }          @override         public int getcount() {             // show 3 total pages.             return 4;         }          @override         public charsequence getpagetitle(int position) {             switch (position) {                 case 0:                     return  massage ;                 case 1:                     return  add ons ;                 case 2:                     return  foot&amp;nail care ;                 case 3:                     return  benefits ;             }             return null;         }     } } </code></pre>   and heres my tab1 class and .xml   <pre><code>&lt; xml version= 1.0  encoding= utf-8  &gt; &lt;linearlayout xmlns:android= http://schemas.android.com/apk/res/android      android:layout_width= match_parent  android:layout_height= match_parent      android:descendantfocusability= blocksdescendants &gt;       &lt;radiogroup         android:layout_width= match_parent          android:layout_height= match_parent  &gt;          &lt;scrollview             android:layout_width= match_parent              android:layout_height= match_parent              android:layout_weight= 1 &gt;              &lt;linearlayout                 android:layout_width= match_parent                  android:layout_height= wrap_content                  android:orientation= vertical  &gt;                  &lt;checkbox                     android:id= @+id/mc1                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt1  /&gt;                  &lt;checkbox                     android:id= @+id/mc2                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt2  /&gt;                  &lt;checkbox                     android:id= @+id/mc3                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt3  /&gt;                  &lt;checkbox                     android:id= @+id/mc4                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt4  /&gt;                  &lt;checkbox                     android:id= @+id/mc5                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt5  /&gt;                  &lt;checkbox                     android:id= @+id/mc6                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt6  /&gt;                  &lt;checkbox                     android:id= @+id/mc7                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt7  /&gt;                  &lt;checkbox                     android:id= @+id/mc8                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt8  /&gt;                  &lt;checkbox                     android:id= @+id/mc9                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt9  /&gt;                  &lt;checkbox                     android:id= @+id/mc10                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt10                      /&gt;                  &lt;checkbox                     android:id= @+id/mc11                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt11                      /&gt;                  &lt;checkbox                     android:id= @+id/mc12                      android:layout_width= match_parent                      android:layout_height= 70dp                      android:text= @string/cmt12  /&gt;              &lt;/linearlayout&gt;         &lt;/scrollview&gt;      &lt;/radiogroup&gt; &lt;/linearlayout&gt; </code></pre>   .   <pre><code>public class tab1 extends android.support.v7.app.appcompatdialogfragment {     @nullable     @override     public view oncreateview(layoutinflater inflater  @nullable viewgroup container  bundle savedinstancestate) {         return inflater.inflate(r.layout.tab1 container false);     } } </code></pre>   heres my popup in reserved offers in navigationview:    public class no extends activity {   <pre><code>    @override     protected void oncreate(bundle savedinstancestate) {         super.oncreate(savedinstancestate);         setcontentview(r.layout.no);         displaymetrics dm = new displaymetrics();         getwindowmanager().getdefaultdisplay().getmetrics(dm);          int width = dm.widthpixels;         int height = dm.heightpixels;          getwindow().setlayout(width height);     } }  &lt;relativelayout xmlns:android= http://schemas.android.com/apk/res/android      android:orientation= vertical  android:layout_width= match_parent      android:layout_height= match_parent &gt;      &lt;textview         android:id= @+id/selectedoffers          android:layout_width= wrap_content          android:layout_height= wrap_content          android:layout_alignparentend= true          android:layout_alignparenttop= true          android:layout_marginend= 111dp          android:layout_margintop= 198dp          android:text= pakyu!  /&gt;   &lt;/relativelayout&gt; </code></pre>",
    "TRUE": 1,
    "Predicted": 1,
    "True Label": "android",
    "Predicted Label": "android",
    "Predicted_XY": 1.592754738,
    "True_XY": 18.15966611
  },
  {
    "": 33573,
    "Post": "mysql select between 2 dates (timestamps stored as int)  i have this record in the <code>sales</code> table:    <code>time</code>: 1487884981 (int)  <code>amount</code>: 10    when running this query  i get null.   <pre><code>select sum(`amount`) from `sales` where `time` between date_sub(1488949200  interval 30 day) and 1488949200; </code></pre>   what should i modify to get the desired result 10     note to clarify: the query should return the sum of all records that are in between (1488949200 - 30 days) and 1488949200  and in this case it should return 10 because the record s timestamp is in between those 2 different dates.",
    "TRUE": 14,
    "Predicted": 14,
    "True Label": "mysql",
    "Predicted Label": "mysql",
    "Predicted_XY": 14.87735396,
    "True_XY": 5.800405168
  },
  {
    "": 39385,
    "Post": "how to install my app to client s iphone without itunes connect  recently i got an order to create a ios app. the problem is that the man made the order is really far from me and he want to test the app before i publish it to itunes. he is not a developer himself. how that could be done",
    "TRUE": 9,
    "Predicted": 9,
    "True Label": "ios",
    "Predicted Label": "ios",
    "Predicted_XY": 9.839428148,
    "True_XY": 10.29899846
  },
  {
    "": 35388,
    "Post": "play and record video while playing some backgorund music  i looked in several forums and they all couldn t deliver a satisfying answer.    my wish is to be able to play and record video while playing music at the background. i managed to do that with the help of a snippet i found. here is the code:   <pre><code>    avaudiosession *session = [avaudiosession sharedinstance]; session.delegate = self;  nserror *error = nil; [session setcategory:avaudiosessioncategoryplayandrecord error:&amp;error];  osstatus propertyseterror = 0;  uint32 allowmixing = true;   propertyseterror = audiosessionsetproperty (                                              kaudiosessionproperty_overridecategorymixwithothers   // 1                                              sizeof (allowmixing)                                  // 2                                              &amp;allowmixing                                          // 3                                              ); [session setactive:yes error:&amp;error]; </code></pre>   the problem is while recording  i can only hear the background music through the ear speaker instead of the regular speaker.    how can i set the regular speaker to work so that the recording session won t be interrupted     thanks in advance",
    "TRUE": 9,
    "Predicted": 9,
    "True Label": "ios",
    "Predicted Label": "ios",
    "Predicted_XY": 9.818777154,
    "True_XY": 10.250577
  },
  {
    "": 33208,
    "Post": "class static method returning struct containing object of this class  i ve got a class:   <pre><code>class someclass {     public:         (...)         static somestruct getinfo();  }; </code></pre>   and a struct:   <pre><code>struct somestruct {     (...)     someclass instance; }; </code></pre>   they are declared in somestruct.h and someclass.h    i m not able to compile it  even with forward declarations. i m still getting:   <pre><code>error: field ‘instance’ has incomplete type </code></pre>   how can i solve that",
    "TRUE": 6,
    "Predicted": 11,
    "True Label": "c++",
    "Predicted Label": "java",
    "Predicted_XY": 11.1089173,
    "True_XY": 13.67512362
  },
  {
    "": 36987,
    "Post": "getting metadata of currently played audio in android  i have created an application to get metadata of currently played audio with the help of mediaplaybackservice in froyo.    now when i am trying it on gingerbread sdk it is crashing as mediaplaybackservice is made local service.    is there any way by which i can bind with this service or any other way by which i can get meta for currently played audio.    thanks     swapnil",
    "TRUE": 1,
    "Predicted": 1,
    "True Label": "android",
    "Predicted Label": "android",
    "Predicted_XY": 1.622646746,
    "True_XY": 18.47401593
  }
]
```

## Application Architecture
The application consists of a main `Dashboard` component that manages the state and layout, and two visualization components: `ConfusionMatrix` and `ViewPosts`.

### State Management
-   **`data`**: `DataRow[]` - The full dataset loaded from the CSV.
-   **`filter`**: `{ trueLabel: string | null, predictedLabel: string | null } | null` - Represents the active filter state. Initially `null`.

### Layout (`Dashboard.tsx`)
-   Use a vertical flexbox layout (`display: flex; flex-direction: column; height: 100vh;`).
-   **Top Section (Confusion Matrix)**: Occupies approximately 50-55% of the height.
-   **Bottom Section (View Posts)**: Occupies the remaining height.
-   Pass `data` and `filter` state, along with `setFilter` callback, to the children.

### Component 1: Confusion Matrix (`ConfusionMatrix.tsx`)
This component visualizes the relationship between `True Label` (Rows) and `Predicted Label` (Columns).

**Data Processing:**
1.  Group data by `True Label` and `Predicted Label`.
2.  Calculate the count of records for each group.
3.  Calculate the **Row Percentage**: For each `True Label`, calculate the percentage of the total count that falls into each `Predicted Label`. (e.g., Count of (True=A, Pred=B) / Total Count of True=A).

**Visual Encoding:**
-   **Type**: Heatmap (Grid of Rectangles).
-   **X-Axis**: `Predicted Label` (Categorical). Use `d3.scaleBand`.
-   **Y-Axis**: `True Label` (Categorical). Use `d3.scaleBand`.
-   **Mark**: Rectangles (`<rect>`).
-   **Color**: Fill `#72b966`, Stroke `#59a14f`. Opacity should be around 0.75 (193/255).
-   **Size/Opacity**: The visual weight represents the percentage. Since the color is static, you can map the percentage to the opacity or simply render the text label. The Tableau workbook uses a single color with transparency. We will use the calculated percentage to determine the opacity (e.g., `0.2 + (pct * 0.8)`). 
-   **Labels**: Centered text inside each cell displaying the percentage formatted to 1 decimal place (e.g., "12.5%"). Font size: 8px.

**Interactions:**
-   **Click**: Clicking a cell sets the global `filter` state to `{ trueLabel: cell.y, predictedLabel: cell.x }`.
-   **Highlight**: If a filter is active, highlight the selected cell and dim others (optional, but good for UX).

### Component 2: View Posts (`ViewPosts.tsx`)
This component is a scatter plot visualizing individual posts.

**Data Processing:**
1.  Filter the `data` prop based on the `filter` prop.
    -   If `filter` is null, show all data.
    -   If `filter` is set, show only rows where `True Label` matches `filter.trueLabel` AND `Predicted Label` matches `filter.predictedLabel`.

**Visual Encoding:**
-   **Type**: Scatter Plot.
-   **X-Axis**: `Predicted_XY` (Quantitative). Range: Fixed domain `[-0.4, 20.0]`. Use `d3.scaleLinear`.
-   **Y-Axis**: `True_XY` (Quantitative). Range: Fixed domain `[-0.25, 20.25]`. Use `d3.scaleLinear`.
-   **Marks**: Points (`<path>` or `<circle>` or `<use>`).
-   **Color**: Encodes `Predicted Label`. Use `d3.scaleOrdinal` with the specific color palette defined below.
-   **Shape**: Encodes `True Label`. Use `d3.scaleOrdinal` with the specific shape mapping defined below.
-   **Size**: Encodes `F1`. Use `d3.scaleSqrt` or `d3.scaleLinear`. Base size approx 4-5px.

**Palettes & Mappings:**

*Color Palette (Predicted Label):*
```javascript
const colorPalette = {
  "html": "#499894",
  ".net": "#4e79a7",
  "c": "#59a14f",
  "javascript": "#79706e",
  "ios": "#86bcb6",
  "c#": "#8cd17d",
  "ruby-on-rails": "#9d7660",
  "android": "#a0cbe8",
  "php": "#b07aa1",
  "c++": "#b6992d",
  "jquery": "#bab0ac",
  "mysql": "#d37295",
  "python": "#d4a6c8",
  "sql": "#d7b5a6",
  "iphone": "#e15759",
  "css": "#f1ce63",
  "angularjs": "#f28e2b",
  "objective-c": "#fabfd2",
  "java": "#ff9d9a",
  "asp.net": "#ffbe7d"
};
```

*Shape Mapping (True Label):*
Map Tableau shapes to D3 symbols or SVG paths.
-   "asterisk" -> `d3.symbolAsterisk` (or custom path)
-   "circle" -> `d3.symbolCircle`
-   "diamond" -> `d3.symbolDiamond`
-   "square" -> `d3.symbolSquare`
-   "triangle" -> `d3.symbolTriangle`
-   "cross" -> `d3.symbolCross` (for "times")
-   "plus" -> `d3.symbolCross` (rotated 45deg or custom path)
-   "down-triangle" -> `d3.symbolTriangle` (rotated 180deg)
-   "left-triangle" -> `d3.symbolTriangle` (rotated -90deg)
-   "right-triangle" -> `d3.symbolTriangle` (rotated 90deg)

**Tooltip:**
Implement a custom HTML tooltip that follows the mouse cursor. It should display:
-   **ID**: `F1`
-   **Post**: `Post` (truncated if too long)
-   **Predicted Label**: `Predicted Label`
-   **True Label**: `True Label`

**Styling Details:**
-   Axes should have titles ("Predicted" for X, "True" for Y).
-   Grid lines should be subtle (dashed or light gray).
-   Margins should be sufficient to accommodate labels.

## Implementation Steps
1.  Setup Vite + React + TypeScript.
2.  Install D3 dependencies.
3.  Create `types.ts` for `DataRow`.
4.  Create `useData.ts` hook to fetch and parse CSV.
5.  Implement `ConfusionMatrix.tsx`.
6.  Implement `ViewPosts.tsx`.
7.  Implement `Dashboard.tsx` to orchestrate layout and state.
8.  Style to match the clean, data-dense aesthetic of the Tableau workbook.

## Data Loading (Full Dataset)
Full data files are served from the Vite public directory under `/data/...`.

Available files:
- /data/Tableau_CSV.csv

Example (CSV via fetch):
```ts
async function loadCsv(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const csvText = await res.text();
  // Prefer a robust CSV parser (e.g. PapaParse) for production; keep a minimal parser if needed.
  const [headerLine, ...lines] = csvText.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines.map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

// Default entrypoint
const rows = await loadCsv("/data/Tableau_CSV.csv");
```

## Tableau Render Contract (Authoritative)
The structured render contract below is mandatory and overrides ambiguous wording in the rest of the prompt.
Contract file path: `/Users/jack/Developer/VISProjects/Image2UICode/generated-react-app/tableau_dashboard_6490/docs/tableau_render_contract.json`
- Every worksheet must follow its `chart_intent`, field bindings, ordering, and fidelity rules.
- If prose sections conflict with this contract, this contract wins.
- Do not clip axis/category labels; preserve full text visibility (or right-side ellipsis with tooltip).
- Ensure long titles are wrapped or laid out without text truncation.
- Render legends and axis titles when required by the contract.
- Render dashboard-level text zones (`dashboard_text_zones`) with exact wording and run-level emphasis.
- Reproduce Tableau highlight/filter actions from the interaction contract.
### Worksheet: Confusion Matrix
- chart_intent: `horizontal_ranked_bar`
- rows_field: `[federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:True Label:nk]`
- cols_field: `[federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:Predicted Label:nk]`
- bar_orientation: `horizontal`
- zone: x=681, y=1048, w=98638, h=52010
- highlight_fields: [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:Predicted Label:nk], [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:True Label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Sort bars descending by displayed measure unless manual_sort dictates otherwise.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
### Worksheet: View Posts
- chart_intent: `custom_tableau_view`
- rows_field: `[federated.1hlnovp00seyjs1bjoccw04wt9vr].[sum:True_XY:qk]`
- cols_field: `[federated.1hlnovp00seyjs1bjoccw04wt9vr].[sum:Predicted_XY:qk]`
- series_field: `[federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:Predicted Label:nk]`
- axis_title_rows: True
- axis_title_cols: Predicted
- zone: x=681, y=53058, w=98638, h=45894
- highlight_fields: [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:True Label:nk], [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:Post:nk], [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:Predicted Label:nk]
- rule: Preserve title wording and emphasis from title_runs.
- rule: Preserve full category labels; no clipped leading/trailing characters.
- rule: Use dynamic chart margins so axis labels are fully visible.
- rule: Render axis titles exactly as defined in the Tableau axis style rules.
- rule: Preserve on-select highlight interactions and keep auto-clear behavior for selection state.
## Dashboard Actions
- Filter 1 (generated): kind=filter_action, source=Confusion Matrix, target=Dashboard
## Highlight Bindings
- View Posts: [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:True Label:nk]
- View Posts: [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:Post:nk], [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:Predicted Label:nk], [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:True Label:nk]
- Confusion Matrix: [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:Predicted Label:nk], [federated.1hlnovp00seyjs1bjoccw04wt9vr].[none:True Label:nk]
