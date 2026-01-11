import { supabase } from '../lib/supabase';
import { deepCleanObject } from './blueprintGenerator';

/**
 * Migration utility to clean control characters from existing blueprints in the database.
 * This should be run once to fix historical data that may contain control characters.
 */
export async function migrateBlueprintData(): Promise<{ success: boolean; updated: number; errors: number; message: string }> {
  console.log('🔄 Starting blueprint data migration...');

  let updatedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  try {
    // Fetch all blueprints from the database
    const { data: blueprints, error: fetchError } = await supabase
      .from('blueprints')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching blueprints:', fetchError);
      return {
        success: false,
        updated: 0,
        errors: 1,
        message: `Failed to fetch blueprints: ${fetchError.message}`
      };
    }

    if (!blueprints || blueprints.length === 0) {
      console.log('ℹ️ No blueprints found to migrate');
      return {
        success: true,
        updated: 0,
        errors: 0,
        message: 'No blueprints found to migrate'
      };
    }

    console.log(`📊 Found ${blueprints.length} blueprints to check`);

    // Process each blueprint
    for (const blueprint of blueprints) {
      try {
        // Clean the blueprint data
        const cleanedData = deepCleanObject(blueprint.blueprint_data);

        // Check if data actually changed
        const originalJson = JSON.stringify(blueprint.blueprint_data);
        const cleanedJson = JSON.stringify(cleanedData);

        if (originalJson !== cleanedJson) {
          console.log(`🧹 Cleaning blueprint: ${blueprint.id} - "${blueprint.title}"`);

          // Update the blueprint with cleaned data
          const { error: updateError } = await supabase
            .from('blueprints')
            .update({ blueprint_data: cleanedData })
            .eq('id', blueprint.id);

          if (updateError) {
            console.error(`❌ Error updating blueprint ${blueprint.id}:`, updateError);
            errors.push(`${blueprint.id}: ${updateError.message}`);
            errorCount++;
          } else {
            updatedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing blueprint ${blueprint.id}:`, error);
        errors.push(`${blueprint.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    const message = `Migration complete: ${updatedCount} blueprints updated, ${errorCount} errors`;
    console.log(`✅ ${message}`);

    if (errors.length > 0) {
      console.log('Errors:', errors);
    }

    return {
      success: errorCount === 0,
      updated: updatedCount,
      errors: errorCount,
      message
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Migration failed:', errorMessage);
    return {
      success: false,
      updated: updatedCount,
      errors: errorCount + 1,
      message: `Migration failed: ${errorMessage}`
    };
  }
}

/**
 * Check if any blueprints in the database contain control characters
 */
export async function checkForControlCharacters(): Promise<{
  hasIssues: boolean;
  affectedBlueprints: Array<{ id: string; title: string }>;
  message: string;
}> {
  console.log('🔍 Checking for control characters in blueprints...');

  try {
    const { data: blueprints, error: fetchError } = await supabase
      .from('blueprints')
      .select('id, title, blueprint_data');

    if (fetchError) {
      console.error('❌ Error fetching blueprints:', fetchError);
      return {
        hasIssues: false,
        affectedBlueprints: [],
        message: `Error: ${fetchError.message}`
      };
    }

    if (!blueprints || blueprints.length === 0) {
      return {
        hasIssues: false,
        affectedBlueprints: [],
        message: 'No blueprints found'
      };
    }

    const affectedBlueprints: Array<{ id: string; title: string }> = [];
    const controlCharRegex = /[\x00-\x08\x0B-\x0C\x0E-\x1F]/;

    for (const blueprint of blueprints) {
      const jsonString = JSON.stringify(blueprint.blueprint_data);
      if (controlCharRegex.test(jsonString)) {
        affectedBlueprints.push({
          id: blueprint.id,
          title: blueprint.title
        });
      }
    }

    const hasIssues = affectedBlueprints.length > 0;
    const message = hasIssues
      ? `Found ${affectedBlueprints.length} blueprints with control characters`
      : 'No control character issues found';

    console.log(`📊 ${message}`);

    if (hasIssues) {
      console.log('Affected blueprints:', affectedBlueprints);
    }

    return {
      hasIssues,
      affectedBlueprints,
      message
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Check failed:', errorMessage);
    return {
      hasIssues: false,
      affectedBlueprints: [],
      message: `Check failed: ${errorMessage}`
    };
  }
}
