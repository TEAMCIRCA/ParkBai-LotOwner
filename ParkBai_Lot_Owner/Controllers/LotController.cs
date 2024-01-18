using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace LotOwner.Controllers
{
    public class LotController : Controller
    {
        public ActionResult ParkingLot()
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
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }
        public ActionResult ParkingHistory()
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
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }

        public ActionResult Info()
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
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }

        public ActionResult Analytics()
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
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }

        public ActionResult WithdrawRequest()
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
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }

        public ActionResult WithdrawHistory()
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
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
        }

        public ActionResult Profile()
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
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();

        }

        public ActionResult RatingAndComments()
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
            Response.Cache.SetCacheability(HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Expires", "0");
            return View();
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
    }
}