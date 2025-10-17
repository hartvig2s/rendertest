'use client'

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold', // Fallback for Recoleta
  },
  infoBox: {
    border: '1px solid #000',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  infoText: {
    fontSize: 11,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  patternText: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 1.5,
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  },
  gridContainer: {
    marginTop: 20,
    marginBottom: 20,
    maxWidth: '100%',
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  gridCell: {
    width: 4,
    height: 4,
    border: '0.3px solid #999',
  },
  gridCellFilled: {
    backgroundColor: '#000',
  },
  gridCellOpen: {
    backgroundColor: '#FFF',
  },
  gridNumbering: {
    fontSize: 7,
    color: '#666',
    marginHorizontal: 2,
  },
  numberingContainer: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 5,
  },
});

interface PatternPDFProps {
  projectName: string;
  gridWidth: number;
  gridHeight: number;
  totalSkeins: number;
  frontGrid: boolean[][] | null;
  backGrid: boolean[][] | null;
  stitchInterpretation: 'black_filled' | 'black_open';
  edgePattern: string;
  frontGridSVG: string | null;
  backGridSVG: string | null;
}

// Helper function to check if bottom row is fully filled
const isBottomRowFullyFilled = (grid: boolean[][], interpretation: 'black_filled' | 'black_open'): boolean => {
  if (!grid || grid.length === 0) return false;
  const bottomRow = grid[grid.length - 1];

  // Check if all cells in bottom row are filled (considering interpretation)
  return bottomRow.every(cell => interpretation === 'black_filled' ? cell : !cell);
};

// Helper function to check if bottom row has openings
const hasOpeningsInBottomRow = (grid: boolean[][], interpretation: 'black_filled' | 'black_open'): boolean => {
  if (!grid || grid.length === 0) return false;
  const bottomRow = grid[grid.length - 1];

  // Check if any cells in bottom row are open (considering interpretation)
  return bottomRow.some(cell => interpretation === 'black_filled' ? !cell : cell);
};

export const PatternPDF: React.FC<PatternPDFProps> = ({
  projectName: _projectName,
  gridWidth,
  gridHeight,
  totalSkeins,
  frontGrid,
  backGrid,
  stitchInterpretation,
  edgePattern: _edgePattern,
  frontGridSVG,
  backGridSVG,
}) => {
  console.log('PatternPDF received:', {
    hasFrontGridSVG: !!frontGridSVG,
    hasBackGridSVG: !!backGridSVG,
    frontGridSVGLength: frontGridSVG?.length,
    backGridSVGLength: backGridSVG?.length
  });

  // Calculate N for the pattern instructions
  const N = (gridWidth * 2) - 1;

  // Determine which pattern instruction to use
  const useFullyFilledInstruction = frontGrid ? isBottomRowFullyFilled(frontGrid, stitchInterpretation) : false;
  const useOpeningsInstruction = frontGrid ? hasOpeningsInBottomRow(frontGrid, stitchInterpretation) : false;

  // Detailed pattern instructions in traditional Norwegian crochet style
  const getPatternInstructions = () => {
    const instructions: string[] = [];

    // Introduction
    instructions.push('FILET-HEKLEDE VESKE - Trinn-for-trinn oppskrift\n');

    // Step 1: Foundation/Bottom
    instructions.push('TRINN 1: BUNNKJEDEN');
    instructions.push(`Hekle ${N} luftmasker (lm). Dette utgjør lengden på veskens bunn.`);
    instructions.push(`Hekle 2 lm til (vendekjede).`);

    // Step 2: First side of foundation
    instructions.push('\nTRINN 2: FØRSTE SIDE AV BUNNEN');

    if (useFullyFilledInstruction && !useOpeningsInstruction) {
      // Fully filled bottom row
      instructions.push(`Hekle 1 stav (st) i den siste av de ${N} lm (den ${N}. lm fra kroken).`);
      instructions.push(`Fortsett med 1 st i hver av de resterende ${N - 1} lm.`);
      instructions.push(`I den siste lm: Hekle 3 st i samme maske. Dette danner hjørnet.`);
    } else {
      // Bottom row with openings - follow diagram
      instructions.push(`Følg diagrammet for bunnens første rad (nederste rad i diagrammet):`);
      instructions.push(`• Fylt rute = 2 staver i luftmasken`);
      instructions.push(`• Åpen rute = 1 luftmaske, hopp over 1 luftmaske i bunnkjeden`);
      instructions.push(`Start i den siste av de ${N} lm og arbeid mot starten.`);
    }

    // Step 3: Second side of foundation
    instructions.push('\nTRINN 3: ANDRE SIDE AV BUNNEN');
    instructions.push(`Følg første rad på det andre diagrammet, samme vei.`);
    instructions.push(`Hekles alltid fra høyre til venstre.`);

    instructions.push(`Avslutt runden med 1 kjedemaske (km) i toppen av de 2 første vendekjedene.`);
    instructions.push(`Du har nå heklet den første raden i diagrammet ditt.`);

    // Step 4: Working the sides
    instructions.push('\n\nTRINN 4: HEKLE SIDENE (FILET-MØNSTER)');
    instructions.push(`Fra og med neste omgang skal du følge diagrammet rad for rad.`);
    instructions.push(`Diagrammet leses fra bunnen og oppover.`);

    instructions.push('\nSlik leser du diagrammet:');
    instructions.push(`Skal alltid leses fra høyre til venstre.`);
    instructions.push(`• SVART/FYLT RUTE = 2 staver`);
    instructions.push(`• HVIT/ÅPEN RUTE = 1 stavmaske og 1 luftmaske (den neste staven utgjør venstre side av ruten)`);

    instructions.push('\nFor hver omgang/rad:');
    instructions.push(`1. Start hver omgang med 2 lm (vendemaske).`);
    instructions.push(`2. Følg diagrammet fra høyre mot venstre.`);
    instructions.push(`3. Hekle masker i samsvar med mønsteret (fylt eller åpen rute).`);
    instructions.push(`4. Avslutt omgangen med 1 km i toppen av vendemaskene.`);

    instructions.push('\nViktige detaljer:');
    instructions.push(`• Når du hekler en fylt rute: Hekle 2 staver gjennom lm-buen.`);
    instructions.push(`• Når du hekler en åpen rute: Hekle 1 st og 1 lm. Den neste staven (i neste rute) danner venstre side av den åpne ruten.`);
    instructions.push(`• Hold jevn stramhet gjennom hele arbeidet.`);
    instructions.push(`• Tell masker jevnlig for å sikre at du følger diagrammet korrekt.`);

    // Step 5: Height and finishing
    instructions.push(`\n\nTRINN 5: HØYDE OG AVSLUTNING`);
    instructions.push(`Fortsett å hekle omganger oppover til du har heklet alle ${gridHeight} radene i diagrammet.`);
    instructions.push(`Veskens høyde blir ca. ${(gridHeight * 0.9).toFixed(1)} cm.`);

    instructions.push('\nAvslutning av siste omgang:');
    instructions.push(`1. Etter siste rad, avslutt med 1 km.`);
    instructions.push(`2. Kutt garnet med ca. 15 cm hale.`);
    instructions.push(`3. Trekk gjennom siste maske og stram til.`);
    instructions.push(`4. Fest garnenden ved å sy den inn på vrangen med nål.`);

    // Step 6: Handles (optional guidance)
    instructions.push('\n\nTRINN 6: HANKER (VALGFRITT)');
    instructions.push(`Du kan lage hanker på flere måter:`);
    instructions.push(`• Hekle luftmaskekjeder og fest dem på innsiden av vesken`);
    instructions.push(`• Hekle tette staver frem og tilbake for en tykkere hank`);
    instructions.push(`• Bruk lærreimer eller kjøpte hanker`);

    instructions.push('\nForslag til heklede hanker:');
    instructions.push(`1. Fest garnet på innsiden av vesken, ca. 5-8 cm fra sidekanten.`);
    instructions.push(`2. Hekle ${Math.max(60, Math.round(gridWidth * 2.5))} lm (juster lengde etter ønske).`);
    instructions.push(`3. Fest med 1 km på innsiden av vesken, 5-8 cm fra andre sidekant.`);
    instructions.push(`4. Gjenta for hank på andre side av vesken.`);

    // Finishing touches
    instructions.push('\n\nFERDIGSTILLESE');
    instructions.push(`• Sy inn alle garnender forsiktig på vrangen.`);
    instructions.push(`• Blokkér vesken om ønskelig: Fukt lett og legg flat til tørk.`);
    instructions.push(`• Valgfritt: Sy i et for av stoff for å beskytte innholdet.`);

    return instructions.join('\n');
  };

  // Render grid image on a separate page
  const renderGridSVGPage = (gridImage: string, title: string) => {
    console.log('Rendering grid page:', title, 'Image length:', gridImage.length);

    return (
      <Page size="A4" style={styles.page}>
        <Text style={styles.gridTitle}>{title} - Diagram</Text>
        <Text style={[styles.infoText, { marginBottom: 10 }]}>
          Rutenettstørrelse: {gridWidth} × {gridHeight} ruter
        </Text>
        <Image
          src={gridImage}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: 650,
            objectFit: 'contain',
          }}
        />
      </Page>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo */}
        <Text style={styles.logo}>Hektet</Text>

        {/* Yarn and tools info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Garn: {totalSkeins} nøster bomullsgarn med vekt på ca. 50 gr / 75 m
          </Text>
          <Text style={styles.infoText}>Heklekrok: 3,5 mm</Text>
          <Text style={styles.infoText}>Heklefasthet:</Text>
          <Text style={styles.infoText}>10 ruter = 10 cm i bredden</Text>
          <Text style={styles.infoText}>9 ruter = 10 cm i høyden</Text>
        </View>

        {/* Glossary box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Ordliste:</Text>
          <Text style={styles.infoText}>Luftmasker = chain stitch</Text>
          <Text style={styles.infoText}>Kjedemasker = slip stitch</Text>
          <Text style={styles.infoText}>Stavmasker = double crochet</Text>
        </View>

        {/* Pattern instructions */}
        <Text style={styles.patternText}>{getPatternInstructions()}</Text>

        {/* Grid info notice */}
        {(frontGridSVG || backGridSVG) && (
          <View style={styles.gridContainer}>
            <Text style={[styles.infoText, { marginTop: 10, fontSize: 10, fontWeight: 'bold' }]}>
              Se neste side(r) for rutenettdiagram
            </Text>
          </View>
        )}
      </Page>

      {/* Front grid SVG on separate page */}
      {frontGridSVG && renderGridSVGPage(frontGridSVG, 'Forside')}

      {/* Back grid SVG on separate page */}
      {backGridSVG && renderGridSVGPage(backGridSVG, 'Bakside')}
    </Document>
  );
};
