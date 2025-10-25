'use client'

import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation('instructions');

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
    instructions.push(t('pdf.pattern.title') + '\n');

    // Step 1: Foundation/Bottom
    instructions.push(t('pdf.pattern.step1'));
    instructions.push(t('pdf.pattern.step1_chain', { N }));
    instructions.push(t('pdf.pattern.step1_turn'));

    // Step 2: First side of foundation
    instructions.push('\n' + t('pdf.pattern.step2'));

    if (useFullyFilledInstruction && !useOpeningsInstruction) {
      // Fully filled bottom row
      instructions.push(t('pdf.pattern.step2_fully_filled', { N }));
      instructions.push(t('pdf.pattern.step2_fully_filled_cont', { 'N-1': N - 1 }));
      instructions.push(t('pdf.pattern.step2_fully_filled_corner'));
    } else {
      // Bottom row with openings - follow diagram
      instructions.push(t('pdf.pattern.step2_openings'));
      instructions.push(t('pdf.pattern.step2_openings_filled'));
      instructions.push(t('pdf.pattern.step2_openings_open'));
      instructions.push(t('pdf.pattern.step2_openings_direction', { N }));
    }

    // Step 3: Second side of foundation
    instructions.push('\n' + t('pdf.pattern.step3'));
    instructions.push(t('pdf.pattern.step3_follow'));
    instructions.push(t('pdf.pattern.step3_direction'));

    instructions.push(t('pdf.pattern.step3_finish'));
    instructions.push(t('pdf.pattern.step3_done'));

    // Step 4: Working the sides
    instructions.push('\n\n' + t('pdf.pattern.step4'));
    instructions.push(t('pdf.pattern.step4_from_next'));
    instructions.push(t('pdf.pattern.step4_read_direction'));

    instructions.push('\n' + t('pdf.pattern.step4_read_title'));
    instructions.push(t('pdf.pattern.step4_read_direction_detail'));
    instructions.push(t('pdf.pattern.step4_read_filled'));
    instructions.push(t('pdf.pattern.step4_read_open'));

    instructions.push('\n' + t('pdf.pattern.step4_each_round'));
    instructions.push(t('pdf.pattern.step4_each_1'));
    instructions.push(t('pdf.pattern.step4_each_2'));
    instructions.push(t('pdf.pattern.step4_each_3'));
    instructions.push(t('pdf.pattern.step4_each_4'));

    instructions.push('\n' + t('pdf.pattern.step4_details'));
    instructions.push(t('pdf.pattern.step4_details_filled'));
    instructions.push(t('pdf.pattern.step4_details_open'));
    instructions.push(t('pdf.pattern.step4_details_tension'));
    instructions.push(t('pdf.pattern.step4_details_count'));

    // Step 5: Height and finishing
    instructions.push(`\n\n${t('pdf.pattern.step5')}`);
    instructions.push(t('pdf.pattern.step5_continue', { gridHeight }));
    instructions.push(t('pdf.pattern.step5_height', { height: (gridHeight * 0.9).toFixed(1) }));

    instructions.push('\n' + t('pdf.pattern.step5_finishing'));
    instructions.push(t('pdf.pattern.step5_finishing_1'));
    instructions.push(t('pdf.pattern.step5_finishing_2'));
    instructions.push(t('pdf.pattern.step5_finishing_3'));
    instructions.push(t('pdf.pattern.step5_finishing_4'));

    // Step 6: Handles (optional guidance)
    instructions.push(`\n\n${t('pdf.pattern.step6')}`);
    instructions.push(t('pdf.pattern.step6_intro'));
    instructions.push(t('pdf.pattern.step6_option1'));
    instructions.push(t('pdf.pattern.step6_option2'));
    instructions.push(t('pdf.pattern.step6_option3'));

    instructions.push('\n' + t('pdf.pattern.step6_suggested'));
    instructions.push(t('pdf.pattern.step6_suggested_1'));
    const handleLength = Math.max(60, Math.round(gridWidth * 2.5));
    instructions.push(t('pdf.pattern.step6_suggested_2', { handleLength }));
    instructions.push(t('pdf.pattern.step6_suggested_3'));
    instructions.push(t('pdf.pattern.step6_suggested_4'));

    // Finishing touches
    instructions.push(`\n\n${t('pdf.pattern.finishing')}`);
    instructions.push(t('pdf.pattern.finishing_1'));
    instructions.push(t('pdf.pattern.finishing_2'));
    instructions.push(t('pdf.pattern.finishing_3'));

    return instructions.join('\n');
  };

  // Render grid image on a separate page
  const renderGridSVGPage = (gridImage: string, title: string) => {
    console.log('Rendering grid page:', title, 'Image length:', gridImage.length);

    return (
      <Page size="A4" style={styles.page}>
        <Text style={styles.gridTitle}>{title} - Diagram</Text>
        <Text style={[styles.infoText, { marginBottom: 10 }]}>
          {t('pdf.gridDimensions', { gridWidth, gridHeight })}
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
        <Text style={styles.logo}>{t('pdf.logo')}</Text>

        {/* Yarn and tools info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {t('pdf.yarn', { totalSkeins })}
          </Text>
          <Text style={styles.infoText}>{t('pdf.hook')}</Text>
          <Text style={styles.infoText}>{t('pdf.tension')}</Text>
          <Text style={styles.infoText}>{t('pdf.tensionWidth')}</Text>
          <Text style={styles.infoText}>{t('pdf.tensionHeight')}</Text>
        </View>

        {/* Glossary box - only show for Norwegian */}
        {i18n.language === 'no' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{t('pdf.glossary')}</Text>
            <Text style={styles.infoText}>{t('pdf.chainStitch')}</Text>
            <Text style={styles.infoText}>{t('pdf.slipStitch')}</Text>
            <Text style={styles.infoText}>{t('pdf.doubleCrochet')}</Text>
          </View>
        )}

        {/* Pattern instructions */}
        <Text style={styles.patternText}>{getPatternInstructions()}</Text>

        {/* Grid info notice */}
        {(frontGridSVG || backGridSVG) && (
          <View style={styles.gridContainer}>
            <Text style={[styles.infoText, { marginTop: 10, fontSize: 10, fontWeight: 'bold' }]}>
              {t('pdf.seeGrids')}
            </Text>
          </View>
        )}
      </Page>

      {/* Front grid SVG on separate page */}
      {frontGridSVG && renderGridSVGPage(frontGridSVG, t('pdf.pattern.frontTitle') || 'Forside')}

      {/* Back grid SVG on separate page */}
      {backGridSVG && renderGridSVGPage(backGridSVG, t('pdf.pattern.backTitle') || 'Bakside')}
    </Document>
  );
};
