import { CropAnalyzer } from './cropdiseasedetection';

const credentials = {
    projectId: 'mindful-backup-419611',
    keyFilename: './google-cloud-key.json'
};

async function analyzeImage(imagePath: string) {
    try {
        const analyzer = new CropAnalyzer(credentials);
        const result = await analyzer.analyzeCropImage(imagePath);

        if (result.error) {
            console.error('Analysis error:', result.error);
            return;
        }

        console.log('📌 Disease Probability:', (result.diseaseProbability * 100).toFixed(2) + '%');
        console.log('🌿 Plant Identification:', result.plantIdentification.name, `(Confidence: ${(result.plantIdentification.confidence * 100).toFixed(2)}%)`);
        
        if (result.conditions.length > 0) {
            console.log('🦠 Detected Conditions:');
            result.conditions.forEach(condition => {
                console.log(`- ${condition.name} (${(condition.confidence * 100).toFixed(2)}%)`);
                if (condition.details) {
                    console.log(`  ➤ Details: ${condition.details}`);
                }
            });
        } else {
            console.log('✅ No disease indicators found.');
        }

        console.log('🎨 Dominant Colors:', result.imageProperties.dominantColors.join(', '));
        console.log('📷 Is Image Blurry?', result.imageProperties.isBlurry ? 'Yes' : 'No');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the function with an example image


export default analyzeImage;