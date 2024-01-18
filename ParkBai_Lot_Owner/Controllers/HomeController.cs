using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace ParkBai_Lot_Owner.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult PreReg()
        {
            bool isAuthenticated = Session["IsAuthenticated"] as bool? ?? false;
            if (Request.HttpMethod != "POST")
            {
                if (isAuthenticated)
                {
                    return RedirectToAction("ParkingLot", "Lot", new { area = "" });
                }
            }
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }

        public ActionResult PreForgot()
        {
            bool isAuthenticated = Session["IsAuthenticated"] as bool? ?? false;
            if (Request.HttpMethod != "POST")
            {
                if (isAuthenticated)
                {
                    return RedirectToAction("ParkingLot", "Lot", new { area = "" });
                }
            }
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }

        public ActionResult SignUp(string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email))
                {
                    return RedirectToAction("PreReg", "Home", new { area = "" });
                }

                byte[] keyBytes = Encoding.UTF8.GetBytes("TEAMCIRCA2023".PadRight(16));
                byte[] ivBytes = Encoding.UTF8.GetBytes("TEAMCIRCA2023".PadRight(16));
                string decryptedEmail = DecryptStringAES(email, keyBytes, ivBytes);

                ViewBag.DecryptedEmail = decryptedEmail;
                return View();
            }
            catch (Exception ex)
            {
                ViewBag.Error = ex.Message;
                return View("Error");
            }
        }

        public ActionResult LogIn()
        {
            bool isAuthenticated = Session["IsAuthenticated"] as bool? ?? false;
            var uid = Session["UserId"];
            if (Request.HttpMethod != "POST")
            {
                if (isAuthenticated)
                {
                    return RedirectToAction("ParkingLot", "Lot", new { area = "" });
                }
            }
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }
        public ActionResult AccPending()
        {
            bool isAuthenticated = Session["IsAuthenticated"] as bool? ?? false;
            var uid = Session["UserId"];
            if (Request.HttpMethod != "POST")
            {
                if (!isAuthenticated)
                {
                    return RedirectToAction("LogIn", "Home", new { area = "" });
                }
            }
            return View();
        }
        private string DecryptStringAES(string encryptedText, byte[] key, byte[] iv)
        {
            using (AesManaged aesAlg = new AesManaged())
            {
                aesAlg.Key = key;
                aesAlg.IV = iv;

                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msDecrypt = new MemoryStream(Convert.FromBase64String(encryptedText)))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {
                            return srDecrypt.ReadToEnd();
                        }
                    }
                }
            }
        }
        public ActionResult SessionLogin()
        {
            var data = new List<object>(2);
            var uid = Request["uid"];
            Session["IsAuthenticated"] = true;
            Session["UserId"] = uid;
            data.Add(new
            {
                mess = 1
            });
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        public ActionResult LOGOUT()
        {
            Session.Clear();
            return Json(new { success = true }, JsonRequestBehavior.AllowGet);
        }
    }
}