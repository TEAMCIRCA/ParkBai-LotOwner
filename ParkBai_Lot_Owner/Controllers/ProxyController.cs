using System;
using System.Web.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text;
using System.Security.Cryptography;
using System.IO;

namespace LotOwner.Controllers
{
    public class ProxyController : Controller
    {
        // Key and IV for AES encryption (replace with your own values)
        private static readonly string encryptionKey = "TEAMCIRCA2023";
        private static readonly string encryptionIV = "TEAMCIRCA2023";

        [HttpPost]
        public async Task<JsonResult> TriggerIFTTT(string eventValue, string key, string emailInput)
        {
            try
            {
                // Convert string key to byte array with correct length
                byte[] keyBytes = Encoding.UTF8.GetBytes(encryptionKey.PadRight(16));
                byte[] ivBytes = Encoding.UTF8.GetBytes(encryptionIV.PadRight(16));

                // Encrypt the emailInput using AES encryption
                string encryptedEmail = EncryptStringAES(emailInput, keyBytes, ivBytes);
                var baseUri = new Uri($"{Request.Url.Scheme}://{Request.Url.Authority}");

                using (HttpClient client = new HttpClient())
                {
                    var payload = new
                    {
                        value1 = emailInput,
                        value2 = $"{baseUri}/Home/SignUp?email={Uri.EscapeDataString(encryptedEmail)}"
                    };

                    var content = new StringContent(JsonConvert.SerializeObject(payload), System.Text.Encoding.UTF8, "application/json");

                    var response = await client.PostAsync($"https://maker.ifttt.com/trigger/{eventValue}/with/key/{key}", content);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseData = await response.Content.ReadAsStringAsync();

                        // Return the raw response data as a string
                        return Json(new { success = true, responseData });
                    }
                    else
                    {
                        return Json(new { error = "IFTTT Request Failed", statusCode = response.StatusCode });
                    }
                }
            }
            catch (Exception ex)
            {
                // Log the exception details for debugging purposes
                Console.WriteLine(ex);

                // Return a meaningful error response for the client
                return Json(new { error = "Internal Server Error", errorMessage = ex.Message });
            }
        }

        // AES encryption method
        private string EncryptStringAES(string plainText, byte[] key, byte[] iv)
        {
            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = key;
                aesAlg.IV = iv;

                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            swEncrypt.Write(plainText);
                        }
                    }

                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }
    }
}