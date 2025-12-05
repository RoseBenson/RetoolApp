# Art Gallery Collection

A sophisticated web application for exploring and visualizing art collections from museum datasets. Built with vanilla JavaScript, this application provides an elegant interface for browsing artists and their artworks with advanced data processing and filtering capabilities.

## Overview

This application transforms raw CSV museum data into an interactive, visually stunning gallery experience. Users can explore thousands of artworks, search for artists, and discover connections between creators and their masterpieces.

## Features

### Data Processing
- **CSV File Parsing**: Custom parser handles complex CSV files with quoted fields and embedded commas
- **Intelligent Data Filtering**: Automatically removes entries with missing artist identifiers
- **Duplicate Column Removal**: Uses Lodash to identify and eliminate redundant columns across datasets
- **Optimized Data Structures**: Implements JavaScript Map for efficient artist-to-artwork associations

### User Interface
- **Dual Table Display**: Separate, tabbed views for artists and artworks data
- **Real-time Artist Search**: Instant filtering with autocomplete suggestions
- **Responsive Grid Layout**: Artwork cards adapt to any screen size
- **Fallback Image Handling**: Elegant placeholders for artworks without images
- **Empty State Management**: Clear messaging when artists have no associated artworks

### Design
- **Selfridges-Inspired Aesthetics**: Luxury design with refined color palette
- **Typography**: Playfair Display serif paired with Montserrat sans-serif
- **Smooth Animations**: Subtle transitions and hover effects throughout
- **Premium Color Scheme**: Sophisticated blacks, golds, and rose gold accents
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Technology Stack

- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Modern layouts using Grid and Flexbox
- **JavaScript (ES6+)**: Vanilla JS with modern features
- **Lodash**: Utility library for data manipulation
- **Google Fonts**: Playfair Display and Montserrat typefaces

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for loading CSV files)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RoseBenson/RetoolApp.git
cd RetoolApp
```

2. Ensure your CSV files are in the root directory:
   - `artists.csv`
   - `artworks_sampled.csv`

3. Start a local web server:

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

4. Open your browser and navigate to:
```
http://localhost:8000
```

### Usage

#### Loading Data

**Option 1: Load Sample Data**
1. Click the "Load Sample Data" button
2. The application automatically fetches and processes the CSV files
3. Data tables and search interface will appear

**Option 2: Upload Custom Files**
1. Click "Upload Your Own Files" to reveal upload interface
2. Select your `artists.csv` file
3. Select your `artworks_sampled.csv` file
4. Click "Process Collections"

#### Exploring the Collection

1. **View Data Tables**: Use the tabs to switch between Artists and Artworks tables
2. **Search for Artists**: Type in the search box to find artists (only shows those with artworks)
3. **Select an Artist**: Click on a search result to view their collection
4. **Browse Artworks**: Scroll through the grid of artwork cards
5. **View Details**: Each card displays title, date, medium, and dimensions

## Data Requirements

### Artists CSV Format
Expected columns:
- `ConstituentID`: Unique identifier for each artist
- `DisplayName`: Artist's display name
- `ArtistBio`: Biographical information
- `Nationality`: Artist's nationality
- `Gender`: Artist's gender
- `BeginDate`: Birth year
- `EndDate`: Death year

### Artworks CSV Format
Expected columns:
- `ObjectID`: Unique identifier for each artwork
- `Title`: Artwork title
- `ConstituentID`: Artist identifier(s) - can be comma-separated for multiple artists
- `Date`: Creation date
- `Medium`: Artwork medium
- `Dimensions`: Physical dimensions
- `ThumbnailURL` or `ImageURL`: Image location
- `Department`: Museum department

## Data Processing Pipeline

1. **CSV Parsing**: Files are read and parsed into JavaScript objects
2. **Validation**: Rows with empty `ConstituentID` are removed
3. **Deduplication**: Duplicate columns between datasets are identified using Lodash's `intersection()`
4. **Column Removal**: Redundant columns are stripped from artworks dataset
5. **Mapping**: Artist-to-artwork relationships are stored in a Map data structure
6. **Filtering**: Only artists with artworks in the collection are searchable

## Architecture

### File Structure
```
RetoolApp/
├── index.html          # Main HTML structure
├── styles.css          # Styling and design system
├── app.js              # Application logic and data processing
├── artists.csv         # Artists data file
├── artworks_sampled.csv # Artworks data file
└── README.md           # Documentation
```

### Key Functions

**Data Processing:**
- `parseCSV()`: Converts CSV text to JavaScript objects
- `parseCSVLine()`: Handles quoted fields and embedded commas
- `createArtistToArtworksMap()`: Builds Map of artist-artwork relationships
- `processData()`: Main processing pipeline

**Display Functions:**
- `displayTables()`: Renders data in tabular format
- `performSearch()`: Filters artists based on search query
- `selectArtist()`: Displays selected artist's information
- `displayArtworks()`: Renders artwork grid

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Table displays are limited to first 50 rows for initial render
- Search results are capped at 20 matches
- Images load lazily with error handling
- Map data structure provides O(1) lookup time

### Development Setup

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Museum collection data providers
- Lodash library maintainers
- Google Fonts for typography

## Contact

Rose Benson - [@RoseBenson](https://github.com/RoseBenson)

Project Link: https://rosebenson.github.io/MoMaAppforRetool/



Note: Ensure CSV files are included in the repository for the "Load Sample Data" feature to work on GitHub Pages.

