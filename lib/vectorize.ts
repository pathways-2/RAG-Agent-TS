import { Configuration, PipelinesApi } from "@vectorize-io/vectorize-client";
import type { VectorizeDocument, VectorizeResponse } from "@/types/vectorize";
import type { ChatSource } from "@/types/chat";

export class VectorizeService {
  private pipelinesApi: any;
  private organizationId: string;
  private pipelineId: string;

  constructor() {
    const config = new Configuration({
      accessToken: process.env.VECTORIZE_PIPELINE_ACCESS_TOKEN,
      basePath: "https://api.vectorize.io/v1",
    });

    this.pipelinesApi = new PipelinesApi(config);
    this.organizationId = process.env.VECTORIZE_ORGANIZATION_ID!;
    this.pipelineId = process.env.VECTORIZE_PIPELINE_ID!;
  }

  async retrieveDocuments(
    question: string,
    numResults: number = 10
  ): Promise<VectorizeDocument[]> {
    try {
      const response = await this.pipelinesApi.retrieveDocuments({
        organization: this.organizationId,
        pipeline: this.pipelineId,
        retrieveDocumentsRequest: {
          question,
          numResults,
        },
      });

      return response.documents || [];
    } catch (error: any) {
      console.error("Vectorize API Error:", error?.response);
      if (error?.response?.text) {
        console.error("Error details:", await error.response.text());
      }
      throw new Error("Failed to retrieve documents from Vectorize");
    }
  }

  formatDocumentsForContext(documents: VectorizeDocument[]): string {
    if (!documents.length) {
      return "No relevant documents found.";
    }

    // Sort documents by relevancy/similarity score
    const sortedDocs = [...documents].sort((a, b) => 
      (b.relevancy || b.similarity || 0) - (a.relevancy || a.similarity || 0)
    );

    // Remove duplicate content and format documents with clear section breaks
    const seenContent = new Set<string>();
    const uniqueDocs: Array<VectorizeDocument & { text: string }> = [];

    for (const doc of sortedDocs) {
      // Clean up the text while preserving important content
      const cleanText = doc.text
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .trim();

      // Create a normalized version for duplicate detection
      const normalizedText = cleanText.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
      
      // Only include if we haven't seen this exact content before
      if (!seenContent.has(normalizedText)) {
        seenContent.add(normalizedText);
        uniqueDocs.push({
          ...doc,
          text: cleanText
        });
      }
    }

    // Format documents with clear section breaks and preserve all content
    return uniqueDocs
      .map((doc, index) => {
        return `Document ${index + 1} (${Math.round((doc.relevancy || doc.similarity || 0) * 100)}% relevant):\n${doc.text}`;
      })
      .join('\n\n==========\n\n');
  }



  convertDocumentsToChatSources(documents: VectorizeDocument[]): ChatSource[] {
    return documents.map((doc) => ({
      id: doc.id,
      title: doc.source_display_name || doc.source,
      url: doc.source,
      snippet: doc.text, // Full text content for hover display
      relevancy: doc.relevancy,
      similarity: doc.similarity,
    }));
  }
}
