
import { POST } from './app/api/validate/bulk/route';
import { NextRequest } from 'next/server';

async function testBulkValidation() {
    try {
        // Create a mock FormData with a file
        const formData = new FormData();
        const csvContent = "AAA010101AAA\nXAXX010101000\nINVALIDRFC123\nEDO980101KW8\nNOL901010AB1";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const file = new File([blob], 'test.csv', { type: 'text/csv' });
        formData.append('file', file);

        // Mock NextRequest
        const req = new NextRequest("http://localhost:3000/api/validate/bulk", {
            method: "POST",
            body: formData,
        });

        // Call the API handler directly
        const response = await POST(req);
        const data = await response.json();

        console.log("Status Code:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));

        if (response.status === 200 && data.success && data.results.length === 5) {
            console.log("TEST PASSED: Bulk validation logic is working.");
        } else {
            console.error("TEST FAILED: Unexpected response.");
        }

    } catch (error) {
        console.error("TEST ERROR:", error);
    }
}

testBulkValidation();
